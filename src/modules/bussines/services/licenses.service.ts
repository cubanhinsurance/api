/*
https://docs.nestjs.com/providers#services
*/

import { InjectRepository } from '@nestjs/typeorm';
import {
  TypeOrmEntityService,
  columns,
  rel,
  TypeOrmService,
} from 'nestjs-typeorm-crud';
import { findOrFail } from 'src/lib/typeorm/id_colection_handler';
import { CoinsEntity } from 'src/modules/enums/entities/coins.entity';
import { LicensesTypesEntity } from 'src/modules/enums/entities/licenses_types.entity';
import { FindConditions, LessThanOrEqual, Repository } from 'typeorm';
import { LicensesEntity } from '../entities/licenses.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  createDecipheriv,
  createCipheriv,
  randomBytes,
  createHmac,
} from 'crypto';
import { ConfigService } from 'nestjs-rconfig-module';
import { v4 } from 'uuid';
import { PayGatewaysEntity } from 'src/modules/enums/entities/pay_gateways.entity';
import { UserLicensesEntity } from '../entities/user_licenses.entity';
import * as moment from 'moment';
import {
  TransactionsEntity,
  TRANSACTION_STATE,
} from '../entities/transactions.entity';
import { paginate, paginate_qr } from 'src/lib/pagination.results';

export enum TRANSACTION_TYPE {
  BUY = 'buy',
  RENEW = 'renew',
  CHANGE = 'change',
}

@TypeOrmEntityService<LicensesService, LicensesEntity>({
  model: {
    type: LicensesEntity,
    name: 'Licencias',
    id: 'licenses',
    relations: rel<LicensesEntity>({
      coin: {
        columns: columns<CoinsEntity>(['name', 'id']),
      },
      type: {},
      coins: {
        columns: columns<CoinsEntity>(['name', 'id']),
      },
    }),
  },
})
export class LicensesService extends TypeOrmService<LicensesEntity> {
  private iv = randomBytes(16);
  private key = randomBytes(32);
  constructor(
    @InjectRepository(LicensesEntity)
    private licensesEntity: Repository<LicensesEntity>,
    @InjectRepository(TransactionsEntity)
    private transactionsEntity: Repository<TransactionsEntity>,
    @InjectRepository(PayGatewaysEntity)
    private payGatewaysEntity: Repository<PayGatewaysEntity>,
    @InjectRepository(UserLicensesEntity)
    private userLicensesEntity: Repository<UserLicensesEntity>,
    @InjectRepository(LicensesTypesEntity)
    private licensesTypesEntity: Repository<LicensesTypesEntity>,
    @InjectRepository(CoinsEntity)
    private coinsEntity: Repository<CoinsEntity>,
    private usersService: UsersService,
    private config: ConfigService,
  ) {
    super(licensesEntity as any);
  }

  async getLicensesTypes() {
    return await this.licensesTypesEntity.find({
      select: ['id', 'name', 'description'],
    });
  }

  async getUsersLicences(
    username?: string,
    userOnly: boolean = false,
    licenseType?: number,
  ): Promise<LicensesEntity[]> {
    const qr = this.repository
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.expiration_date',
        'r.price',
        'r.time',
        'r.max',
        'r.photo',
        'r.description',
      ])
      .leftJoinAndSelect('r.coin', 'coin')
      .innerJoin('r.type', 'type')
      .addSelect(['type.id', 'type.name', 'type.description']);

    if (username !== undefined) {
      qr.leftJoin('r.users', 'u')
        .addSelect(['u.id', 'u.type', 'u.expiration', 'u.renewed_date'])
        .leftJoin('u.user', 'luser')
        .leftJoin('u.transaction', 't')
        .addSelect(['t.state'])
        .andWhere(
          `(
            (
              luser.username=:username and u.active=true
            ) 
            or 
            (
              r.active=true and ${userOnly ? '1=2' : '1=1'}
            )
          )`,
          { username },
        );
    } else {
      qr.andWhere('r.active=true');
    }

    if (licenseType !== undefined) {
      qr.andWhere(`type.id=:licenseType`, { licenseType });
    }

    qr.orderBy('u.expiration,r.expiration_date', 'DESC');
    const resp = await qr.getMany();

    return resp;
  }

  async createLicense(photo, data) {
    if (photo) data.photo = (photo.buffer as Buffer).toString('base64');
    await super.createOne(data);
  }

  async updateLicense(photo, id, data) {
    if (photo) data.photo = (photo.buffer as Buffer).toString('base64');
    await super.replaceOne(id, data);
  }

  get secret() {
    return this.config.config.auth.secret;
  }

  encrypt(data: any) {
    const cipher = createCipheriv(
      'aes-256-ccm',
      Buffer.from(this.key),
      this.iv,
    );
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }

  decrypt(data: string) {
    const a = 6;
  }

  async buyLicense(username: string, license: number, amount: number) {
    const user = await this.usersService.findUserByUserName(username);

    if (!user) throw new NotFoundException(`Usuario: ${username} no existe`);

    const licenseRow = await this.repository.findOne({
      relations: ['type'],
      where: {
        id: license,
        active: true,
      },
    });

    if (!licenseRow) throw new NotFoundException(`Licencia no existe`);

    const [renew] = await this.getUserActiveLicenses(
      username,
      licenseRow.type.id,
    );

    const price = licenseRow.price;
    const time = licenseRow.time;
    const extraTime = renew
      ? moment(renew.expiration).diff(moment(), 'days')
      : 0;

    const licensePrice = price * amount;

    let expiration = moment()
      .add(time * amount, 'days')
      .add(extraTime, 'days')
      .toDate();

    const operationInfo = {
      transactionType: !renew
        ? TRANSACTION_TYPE.BUY
        : renew.type.id != licenseRow.type.id
        ? TRANSACTION_TYPE.CHANGE
        : TRANSACTION_TYPE.RENEW,
      activeLicense: renew,
      newLicense: {
        price: licensePrice,
        expiration,
      },
      user: {
        username: user.username,
        name: user.name,
      },
      license: licenseRow,
      amount,
    };

    const payload = Buffer.from(
      JSON.stringify({
        transactionType: operationInfo.transactionType,
        username,
        license,
      }),
    ).toString('base64');
    const hash = createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    (operationInfo as any).operationId = `${hash}.${payload}`;
    return operationInfo;
  }

  async executePayment({
    amount,
    operationId,
    payGateway,
    coin,
  }: {
    operationId: string;
    payGateway: number;
    amount: number;
    coin?: number;
  }) {
    const [key, payload] = operationId.split('.');
    const hash = createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    if (key != hash) throw new ForbiddenException();

    const { license, transactionType, username, ...p } = JSON.parse(
      Buffer.from(payload, 'base64').toString(),
    );

    const {
      id,
      price,
      time,
      type: licenseType,
      coin: licenseCoin,
    } = await this.licensesEntity.findOne({
      where: { id: license },
      relations: ['type', 'coin'],
    });

    const coinObject =
      coin == undefined
        ? licenseCoin
        : await this.coinsEntity.findOne({
            where: { id: coin },
          });

    const [renew] = await this.getUserActiveLicenses(username, licenseType.id);

    const extraTime = renew
      ? moment(renew.expiration).diff(moment(), 'days')
      : 0;

    const licensePrice = price * amount;
    let expiration = moment()
      .add(time * amount, 'days')
      .add(extraTime, 'days')
      .toDate();

    const gatewayObj = await this.payGatewaysEntity.findOne({
      where: { id: payGateway },
    });

    const user = await this.usersService.findUserByUserName(username);

    const transactionId = v4();

    try {
      //todo executeTransaction
      const transactionCreated = await this.transactionsEntity.save({
        amount: licensePrice * coinObject.factor,
        coin: coinObject,
        date: new Date(),
        from: user,
        gateway: gatewayObj,
        state: TRANSACTION_STATE.PENDENT,
        type: 2 as any,
        transaction_id: transactionId,
      });
      const created = await this.userLicensesEntity.save({
        expiration,
        transaction: transactionCreated,
        type: { id },
        user,
        active: true,
      });

      if (renew) {
        renew.renewed_date = new Date();
        renew.active = false;
        await this.userLicensesEntity.save(renew);
      }

      setTimeout(() => {
        this.updateTransaction(transactionId);
      }, 10000);

      return transactionId;
    } catch (e) {
      const a = 7;
    }
  }

  async transactionConfirmed(transaction_id: string) {
    const transaction = await this.transactionsEntity.findOne({
      where: { transaction_id },
    });

    if (!transaction) throw new NotFoundException();

    return transaction.state == TRANSACTION_STATE.COMPLETED;
  }

  async updateTransaction(
    transaction_id: string,
    state: TRANSACTION_STATE = TRANSACTION_STATE.COMPLETED,
  ) {
    const transaction = await this.transactionsEntity.findOne({
      where: { transaction_id },
    });

    if (!transaction) throw new NotFoundException();

    transaction.state = state;

    const updated = await this.transactionsEntity.save(transaction);
  }

  async getUserActiveLicenses(username: string, type?: number) {
    const qr = await this.userLicensesEntity
      .createQueryBuilder('ul')
      .select(['ul.id', 'ul.expiration'])
      .innerJoin('ul.type', 'l')
      .addSelect([
        'l.id',
        'l.description',
        'l.active',
        'l.photo',
        'l.time',
        'l.price',
        'l.expiration_date',
        'l.max',
      ])
      .innerJoinAndSelect('l.coin', 'lcoin')
      .innerJoin('l.type', 'ltype')
      .addSelect([
        'ltype.id',
        'ltype.description',
        'ltype.features',
        'ltype.name',
      ])
      .innerJoinAndSelect('ul.transaction', 't')
      .innerJoinAndSelect('t.coin', 'tcoin')
      .innerJoin('ul.user', 'u')
      .where(
        `
        (
          u.username=:username and 
        ul.active=true and 
        ul.expiration::date>=now()::date and
        t.state='${TRANSACTION_STATE.COMPLETED}'
        )
        `,
        { username },
      );

    if (type !== undefined) {
      qr.andWhere('ltype.id=:type', { type });
    }

    return await qr.getMany();
  }

  async getUserTransactions(username: string, page: number, page_size: number) {
    const qr = await this.userLicensesEntity
      .createQueryBuilder('ul')
      .select(['ul.id', 'ul.expiration'])
      .innerJoin('ul.type', 'l')
      .addSelect([
        'l.id',
        'l.description',
        'l.active',
        'l.photo',
        'l.time',
        'l.price',
        'l.expiration_date',
      ])
      .innerJoinAndSelect('l.coin', 'lcoin')
      .innerJoin('l.type', 'ltype')
      .addSelect([
        'ltype.id',
        'ltype.description',
        'ltype.features',
        'ltype.name',
      ])
      .innerJoinAndSelect('ul.transaction', 't')
      .innerJoinAndSelect('t.coin', 'tcoin')
      .innerJoin('ul.user', 'u')
      .where(`u.username=:username`, { username })
      .orderBy('t.date', 'DESC');

    return await paginate_qr(page, page_size, qr);
  }
}
