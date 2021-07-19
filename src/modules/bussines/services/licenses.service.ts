/*
https://docs.nestjs.com/providers#services
*/

import { InjectRepository } from '@nestjs/typeorm';
import {
  TypeOrmEntityService,
  columns,
  rel,
  TypeOrmService,
} from '@atlasjs/typeorm-crud';
import { findOrFail } from 'src/lib/typeorm/id_colection_handler';
import { CoinsEntity } from 'src/modules/enums/entities/coins.entity';
import { LicensesTypesEntity } from 'src/modules/enums/entities/licenses_types.entity';
import { FindConditions, Repository } from 'typeorm';
import { LicensesEntity } from '../entities/licenses.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { NotFoundException } from '@nestjs/common';
import { createDecipheriv, createCipheriv, randomBytes } from 'crypto';
import { ConfigService } from '@atlasjs/config';
import { uuid } from 'uuid';

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

  async createLicense(photo, data) {
    if (photo) data.photo = (photo.buffer as Buffer).toString('base64');
    await super.createOne(data);
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
      where: {
        id: license,
        active: true,
      },
    });

    if (!licenseRow) throw new NotFoundException(`Licencia no existe`);

    return {
      user: {
        username: user.username,
        name: user.name,
      },
      license: licenseRow,
      amount,
    };
  }
}
