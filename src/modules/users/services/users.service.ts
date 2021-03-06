import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exception } from 'src/lib/exceptions/exception';
import {
  FindConditions,
  FindManyOptions,
  In,
  IsNull,
  LessThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { AgentDto, TechDto, UserDto } from '../dtos/user.dto';
import { UsersEntity } from '../entities/user.entity';
import { compare, hash } from 'bcryptjs';
import { AgentsEntity } from '../entities/agent.entity';
import { TechniccianEntity } from '../entities/techniccian.entity';
import * as moment from 'moment';
import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { paginate_qr, paginate_repo } from 'src/lib/pagination.results';
import { MunicialitiesEntity } from 'src/modules/enums/entities/municipalities.entity';
import { ProvincesEntity } from 'src/modules/enums/entities/provinces.entity';
import {
  findOrFail,
  handleNumberArr,
} from 'src/lib/typeorm/id_colection_handler';
import { hotp, totp } from 'otplib';
import { createTransport } from 'nodemailer';
import { InjectMailService } from 'src/modules/mail/common';
import { MailService } from 'src/modules/mail/mail.service';
import { RatingsEntity } from 'src/modules/bussines/entities/ratings.entity';

export enum USER_TYPE {
  USER = 'user',
  TECH = 'tech',
  AGENT = 'agent',
}

const ratingsInterceptor = (qb: SelectQueryBuilder<RatingsEntity>): void => {};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity) private usersEntity: Repository<UsersEntity>,
    @InjectRepository(HabilitiesEntity)
    private habilitiesEntity: Repository<HabilitiesEntity>,
    @InjectRepository(AgentsEntity)
    private agentsEntity: Repository<AgentsEntity>,
    @InjectRepository(TechniccianEntity)
    private techsEntity: Repository<TechniccianEntity>,
    @InjectRepository(ProvincesEntity)
    private provinces: Repository<ProvincesEntity>,
    @InjectRepository(MunicialitiesEntity)
    private municipalities: Repository<MunicialitiesEntity>,

    @InjectRepository(RatingsEntity)
    private usersRatingsRepo: Repository<RatingsEntity>,
    @InjectMailService() private mail: MailService,
  ) {
    // const b = 7;
  }

  async findUserByUserName(
    username: string,
    query?: FindConditions<UsersEntity>,
    onlyId: boolean = false,
  ) {
    return await this.usersEntity.findOne({
      select: onlyId ? ['id'] : undefined,
      relations: onlyId
        ? []
        : [
            'techniccian_info',
            'agent_info',
            'agent_info.role',
            'agent_info.role.functionalities',
          ],
      where: {
        username,
        ...query,
      },
    });
  }

  async createUser(user: UserDto) {
    const userDto = new UserDto(user);
    const exists = await this.usersEntity.findOne({
      username: userDto.username,
    });

    if (!!exists)
      throw new ConflictException(`Usuario ${user.username} ya existe`);

    const repatedEmail = await this.usersEntity.findOne({
      where: {
        email: user.email,
      },
    });

    if (!!repatedEmail)
      throw new ConflictException(
        `Ya existe un usuario con ese correo registrado en el sistema`,
      );

    await userDto.generatePassword();
    try {
      return await this.usersEntity.save(userDto as any);
    } catch (e) {
      throw new InternalServerErrorException(
        `Ha ocurrido un error guardando el usuario`,
      );
    }
  }

  async breakHotpCode(username: string | UsersEntity) {
    const user =
      username instanceof UsersEntity
        ? username
        : await findOrFail<UsersEntity>(
            {
              where: {
                username,
              },
            },
            this.usersEntity,
          );

    user.hotp++;
    await this.usersEntity.save(user);
  }

  async generateNewHotpCode(user: UsersEntity) {
    user.hotp++;
    const key = hotp.generate(user.salt, user.hotp);
    await this.usersEntity.save(user);
    return key;
  }

  async verifyUserHotp(username: string | UsersEntity, key: string) {
    const { hotp: h, salt } =
      username instanceof UsersEntity
        ? username
        : await findOrFail<UsersEntity>(
            {
              where: {
                username,
              },
            },
            this.usersEntity,
          );

    const valid = hotp.check(key, salt, h);
    return valid;
  }

  async confirmUser(username: string, key: string) {
    const user = await findOrFail<UsersEntity>(
      {
        where: {
          username,
        },
      },
      this.usersEntity,
    );

    if (user.confirmed)
      throw new ConflictException('Usuario ya se encuentra confirmado');

    const valid = await this.verifyUserHotp(user, key);

    if (!valid) throw new ForbiddenException('Codigo de confirmacion invalido');

    user.confirmed = true;
    const confirm = await this.usersEntity.save(user);

    await this.breakHotpCode(user);
  }

  async sendVerificationEmail(
    username: string,
    email?: string,
    ignoreConfirmed: boolean = true,
  ) {
    const user = await findOrFail<UsersEntity>(
      {
        where: {
          username,
        },
      },
      this.usersEntity,
    );

    if (!ignoreConfirmed && user.confirmed)
      throw new ConflictException('Usuario ya se encuentra confirmado');

    if (email && user.email != email) {
      throw new ForbiddenException('Correo del usuario no coincide');
    }

    const key = await this.generateNewHotpCode(user);

    try {
      this.mail.send({
        from: 'john891226@gmail.com',
        to: user.email,
        subject: 'Codigo de verificacion',
        text: key,
      });
    } catch (e) {
      Logger.error(
        `No se pudo enviar el correo al usuario: ${user.email}, ${e.message}`,
      );
    }
  }

  async updateUser(username: string, data: any, check_last_password = false) {
    const curr = await this.usersEntity.findOne({
      username,
    });

    if (!curr) throw new NotFoundException(`Usuario ${username} no existe`);

    if (data.new_password) {
      if (data.new_password != data.confirm_password)
        throw new BadRequestException(
          `Nueva contrase??a debe coincidir con la antigua`,
        );

      if (
        check_last_password &&
        !(await compare(data.last_password, curr.password))
      )
        throw new ForbiddenException(`Contrase??a no coincide con la antigua`);

      curr.password = await hash(data.new_password, curr.salt);
    }

    if (data.name) curr.name = data.name;
    if (data.username) curr.username = data.username;
    if (!!data.photo) {
      curr.photo =
        typeof data.photo != 'undefined' ? data.photo.toString('base64') : null;
    }
    if (data.lastname) curr.lastname = data.lastname;
    if (data.email) curr.email = data.email;
    if (data.phone_number) curr.phone_number = data.phone_number;
    if (typeof data.telegram_id !== 'undefined') curr.active = data.active;
    if (data.expiration_date || data.expiration_date === null)
      curr.expiration_date = data.expiration_date;
    const updated = await this.usersEntity.save(curr);
    const a = 7;
  }

  async createAgent({ username, role, new_user, expiration_date }: AgentDto) {
    if (!username && !new_user) throw new BadRequestException();

    const user = username
      ? await this.usersEntity.findOne({
          username,
        })
      : await this.createUser(new_user);

    if (username && !user)
      throw new NotFoundException(`Usuario ${username} no existe`);

    if (username) {
      const exists = await this.agentsEntity.findOne({
        user: user.id,
      });
      if (exists)
        throw new ForbiddenException(
          `Ya existe un agente con el usuario ${username}`,
        );
    }

    try {
      const created = await this.agentsEntity.save({
        role: role as any,
        user,
        expiration_date: expiration_date
          ? moment(expiration_date).toDate()
          : null,
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async updateAgent(agent: string, data: any) {
    const user = await this.usersEntity.findOne({
      username: agent,
    });

    if (!user) throw new NotFoundException(`Usuario ${agent} no existe`);

    const agentObj = await this.agentsEntity.findOne({
      relations: ['role'],
      where: {
        user,
      },
    });

    if (!agentObj)
      throw new NotFoundException(
        `No existe ningun agente con el usuario ${agent}`,
      );

    if (data.expiration_date || data.expiration_date === null)
      agentObj.expiration_date = data.expiration_date;
    if (typeof data.role !== 'undefined') agentObj.role = data.role;
    if (typeof data.active !== 'undefined') agentObj.active = data.active;

    const updated = await this.agentsEntity.save(user);
  }

  async createTechnichian({
    username,
    new_user,
    expiration_date,
    habilities: habilities_ids,
    address,
    ci,
    confirmed,
    province,
    municipality,
    confirmation_photo,
    active,
  }: TechDto) {
    if (!username && !new_user) throw new BadRequestException();

    const habilities = await this.habilitiesEntity.find({
      where: { id: In(habilities_ids) },
    });

    if (habilities.length != habilities_ids.length) {
      throw new NotFoundException(`
        No se encontraron las habilidades:
        ${habilities_ids
          .filter((h_id) => !habilities.find((h) => h.id == h_id))
          .join(',')}
      `);
    }

    const user = username
      ? await this.usersEntity.findOne({
          username,
        })
      : await this.createUser(new_user);

    if (username && !user)
      throw new NotFoundException(`Usuario ${username} no existe`);

    if (username) {
      const exists = await this.techsEntity.findOne({
        user: user.id,
      });
      if (exists)
        throw new ForbiddenException(
          `Ya existe un tecnico con el usuario ${username}`,
        );
    }

    const p = await this.provinces.findOne(province);
    if (!p) throw new NotFoundException('No existe la provincia');

    const m = await this.municipalities.findOne(municipality);
    if (!m) throw new NotFoundException('No existe el municipio');

    const usedCi = await this.techsEntity.findOne({
      where: { ci },
    });

    if (usedCi)
      throw new ConflictException(
        `Ya existe un tecnico con esa identificacion`,
      );

    try {
      const ph = confirmation_photo
        ? (confirmation_photo as any).toString('base64')
        : null;
      const created = await this.techsEntity.save({
        user,
        habilities,
        active: active ?? true,
        address,
        ci,
        province: p,
        municipality: m,
        confirmed: confirmed ?? true,
        confirmation_photo: ph,
        expiration_date: expiration_date
          ? moment(expiration_date).toDate()
          : null,
      });
      return created;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async updateTechnichian(tech: string, data: any) {
    const user = await this.usersEntity.findOne({
      username: tech,
    });

    if (!user) throw new NotFoundException(`Usuario ${tech} no existe`);

    const techObj = await this.techsEntity.findOne({
      relations: ['user'],
      where: {
        user,
      },
    });

    if (!techObj)
      throw new NotFoundException(
        `No existe ningun tecnico con el usuario ${tech}`,
      );

    if (data.expiration_date || data.expiration_date === null)
      techObj.expiration_date = data.expiration_date;
    if (typeof data.active !== 'undefined') techObj.active = data.active;
    if (typeof data.ci !== 'undefined') techObj.ci = data.ci;
    if (typeof data.address !== 'undefined') techObj.address = data.address;
    if (typeof data.province !== 'undefined') techObj.province = data.province;
    if (typeof data.municipality !== 'undefined')
      techObj.municipality = data.municipality;
    if (typeof data.confirmation_photo !== 'undefined')
      techObj.confirmation_photo = (data.confirmation_photo as any).toString(
        'base64',
      );
    if (typeof data.confirmed !== 'undefined')
      techObj.confirmed = data.confirmed;
    if (typeof data.habilities != 'undefined') {
      techObj.habilities =
        data.habilities.length == 0
          ? []
          : await handleNumberArr<HabilitiesEntity>(
              data.habilities,
              this.habilitiesEntity,
            );
    }

    try {
      const updated = await this.techsEntity.save(techObj);
    } catch (e) {
      const a = 6;
    }
  }

  async getUserPrivateData(username: string) {
    const data = await this.usersEntity
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.name',
        'u.lastname',
        'u.username',
        'u.email',
        'u.phone_number',
        'u.telegram_id',
        'u.active',
        'u.expiration_date',
        'u.photo',
      ])
      .leftJoinAndSelect('u.agent_info', 'ag')
      .leftJoinAndSelect('ag.role', 'agrole')
      .leftJoinAndSelect('u.techniccian_info', 't')
      .leftJoinAndSelect('t.habilities', 'habilities')
      .leftJoin('t.province', 'province')
      .addSelect(['province.id', 'province.name'])
      .leftJoin('t.municipality', 'municipality')
      .addSelect(['municipality.id', 'municipality.name'])
      .leftJoinAndSelect('habilities.group', 'habilities_group')
      .where('u.username=:username', { username })
      .getOne();

    return data ?? ({} as any);
  }

  async getUsers(
    page: number,
    page_size: number,
    {
      address,
      ci,
      habilities,
      name,
      username,
      agent_active,
      roles,
      tech_active,
      tech_municipalities,
      tech_provinces,
      tech_rating,
      types,
      user_active,
    }: {
      types?: string[];
      username?: string;
      name?: string;
      user_active?: boolean;
      roles?: number[];
      agent_active?: boolean;
      tech_active?: boolean;
      ci?: string;
      address?: string;
      tech_provinces?: number[];
      tech_municipalities?: number[];
      tech_rating?: number[];
      habilities?: number[];
    } = {},
  ) {
    const qr = this.usersEntity
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.name',
        'u.lastname',
        'u.username',
        'u.email',
        'u.phone_number',
        'u.telegram_id',
        'u.active',
        'u.expiration_date',
        'u.photo',
      ])
      .leftJoinAndSelect('u.techniccian_info', 'tech')
      .leftJoinAndSelect('tech.habilities', 'habilities')
      .leftJoinAndSelect('habilities.group', 'habilities_group')
      .leftJoinAndSelect('u.agent_info', 'agent')
      .leftJoinAndSelect('agent.role', 'role');

    if (address !== undefined)
      qr.andWhere('tech.address ilike :address', { address: `%${address}%` });
    if (username !== undefined)
      qr.andWhere('u.username ilike :username', { username: `%${username}%` });
    if (user_active !== undefined)
      qr.andWhere('u.active =:active', { active: user_active });
    if (tech_active !== undefined)
      qr.andWhere('tech.active =:active', { active: tech_active });
    if (agent_active !== undefined)
      qr.andWhere('agent.active =:active', { active: agent_active });
    if (name !== undefined)
      qr.andWhere('(u.name ilike :name or u.lastname ilike :name)', {
        name: `%${name}%`,
      });
    if (ci !== undefined)
      qr.andWhere('(tech.ci ilike :ci)', {
        ci: `%${ci}%`,
      });
    if (roles !== undefined)
      qr.leftJoin('agent.role', 'role').andWhere('(role.id in (:...roles))', {
        roles,
      });
    if (habilities !== undefined) {
      qr.leftJoin('tech.habilities', 'hab').andWhere(
        'hab.id in (:...habilities)',
        { habilities },
      );
    }
    if (tech_provinces !== undefined) {
      qr.leftJoin('tech.province', 'tech_province').andWhere(
        'tech_province.id in (:...tech_provinces)',
        {
          tech_provinces,
        },
      );
    }
    if (tech_municipalities !== undefined) {
      qr.leftJoin('tech.municipality', 'tech_municipality').andWhere(
        'tech_municipality.id in (:...tech_municipalities)',
        {
          tech_municipalities,
        },
      );
    }

    const loadUsers =
      types != undefined && !!types.find((t: any) => t == USER_TYPE.USER);
    const loadTech =
      types != undefined && !!types.find((t: any) => t == USER_TYPE.TECH);
    const loadAgent =
      types != undefined && !!types.find((t: any) => t == USER_TYPE.AGENT);

    qr.andWhere(`(
      (${loadAgent ? 'agent.user notnull and tech.user isnull' : 'false'}) or
      (${loadTech ? 'tech.user notnull and agent.user isnull' : 'false'}) or
      (${loadUsers ? `agent.user isnull and tech.user isnull` : 'false'}) or
      (${
        loadTech && loadAgent
          ? 'agent.user notnull and tech.user notnull'
          : '1=2'
      })
    )`);

    const now = moment();
    const results = await paginate_qr<UsersEntity>(page, page_size, qr);
    for (const u of results.data) {
      if (u.techniccian_info) {
        u.techniccian_info = await this.getTechnichianInfo(u.username);
        const review = await this.getTechniccianReview(u.username);
        (u.techniccian_info as any).rating = review;
        (u.techniccian_info as any).review = review;
        // (u.techniccian_info as any).rating = Math.random() * (5 - 0) + 0;
        if (!!u.techniccian_info.expiration_date && u.techniccian_info.active) {
          u.techniccian_info.active = moment(
            u.techniccian_info.expiration_date,
          ).isAfter(moment());
        }
      }

      if (u.agent_info) {
        if (!!u.agent_info.expiration_date && u.agent_info.active) {
          u.agent_info.active = moment(u.agent_info.expiration_date).isBefore(
            moment(),
          );
        }
      }
    }
    return results;
  }

  async deleteUser(username: string) {
    const { id, agent_info, techniccian_info } = await findOrFail<UsersEntity>(
      {
        where: { username },
        relations: ['techniccian_info', 'agent_info'],
      },
      this.usersEntity,
    );

    await this.usersEntity.softDelete(id);

    if (agent_info) await this.deleteAgent(username);
    if (techniccian_info) await this.deleteTech(username);
  }

  async deleteAgent(username: string) {
    const { user } = await findOrFail<AgentsEntity>(
      {
        where: { username },
      },
      this.agentsEntity,
    );

    await this.agentsEntity.softDelete(user);
  }

  async deleteTech(username: string) {
    const { user } = await findOrFail<TechniccianEntity>(
      {
        where: { username },
      },
      this.techsEntity,
    );

    await this.techsEntity.softDelete(user);
  }

  async getUserLicenses(username: string) {
    return await this.usersEntity
      .createQueryBuilder('u')
      .innerJoin('u.licenses', 'l')
      .innerJoin('l.transaction', 'trans')
      .innerJoinAndSelect('l.type', 'type')
      .select([
        'u.username',
        'l.id',
        'l.expiration',
        'l.active',
        'l.renewed_date',
        'trans.transaction_id',
        'trans.amount',
        'trans.date',
      ])
      .where(`u.username=:username and l.active=true and l.expiration<=now()`, {
        username,
      })
      .getMany();
  }

  async getTechnichianInfo(username: string) {
    return await this.techsEntity
      .createQueryBuilder('t')
      .select([
        't.expiration_date',
        't.active',
        't.confirmed',
        't.ci',
        't.address',
      ])
      .innerJoin('t.user', 'u')
      .addSelect(['u.username', 'u.name', 'u.lastname'])
      .leftJoinAndSelect('t.habilities', 'h')
      .leftJoinAndSelect('t.province', 'province')
      .leftJoinAndSelect('t.municipality', 'municipality')
      .where(`u.username = :username`, { username })
      .getOne();
  }

  async getUserReview(username: string, qb?: typeof ratingsInterceptor) {
    const ctQb = await this.usersRatingsRepo
      .createQueryBuilder('r')
      .innerJoin('r.from', 'from')
      .innerJoin('r.to', 'to')
      .groupBy('r.like')
      .select('count(r.id)', 'ct')
      .addSelect('r.like', 'like')
      .where('to.username=:username', { username });

    if (qb) qb(ctQb);

    const ct = await ctQb.getRawMany();

    let likes = 0;
    let dislikes = 0;

    for (const { ct: c, like } of ct) {
      if (like) likes = +c;
      else dislikes = +c;
    }

    const avgQb = await this.usersRatingsRepo
      .createQueryBuilder('r')
      .innerJoin('r.from', 'from')
      .innerJoin('r.to', 'to')
      .where('to.username=:username', { username })
      .select('avg(r.rating)', 'avg')
      .groupBy('r.to');

    if (qb) qb(avgQb);

    const avg = await avgQb.getRawOne();

    return {
      rating: avg ? +avg.avg : 0,
      reviews: likes + dislikes,
      likes,
      dislikes,
    };
  }

  async getTechniccianReview(username: string) {
    return await this.getUserReview(username, (qb) => {
      qb.innerJoin('to.techniccian_info', 'tinfo').andWhere(
        'r.tech_review=true',
      );
    });
  }

  async getClientReview(username: string) {
    return await this.getUserReview(username, (qb) => {});
  }
}
