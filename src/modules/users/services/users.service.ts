import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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
import { findOrFail } from 'src/lib/typeorm/id_colection_handler';

export enum USER_TYPE {
  USER = 'user',
  TECH = 'tech',
  AGENT = 'agent',
}

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
  ) {}

  async findUserByUserName(
    username: string,
    query?: FindConditions<UsersEntity>,
  ) {
    return await this.usersEntity.findOne({
      relations: [
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

    await userDto.generatePassword();
    try {
      return await this.usersEntity.save(userDto as any);
    } catch (e) {
      throw new InternalServerErrorException(
        `Ha ocurrido un error guardando el usuario`,
      );
    }
  }

  async updateUser(username: string, data: any) {
    const curr = await this.usersEntity.findOne({
      username,
    });

    if (!curr) throw new NotFoundException(`Usuario ${username} no existe`);

    if (data.new_password) {
      if (data.new_password != data.confirm_password)
        throw new BadRequestException(
          `Nueva contraseña debe coincidir con la antigua`,
        );

      if (!(await compare(data.last_password, curr.password)))
        throw new ForbiddenException(`Contraseña no coincide con la antigua`);

      curr.password = await hash(data.new_password, curr.salt);
    }

    if (data.name) curr.name = data.name;
    if (!!data.photo) {
      data.photo =
        typeof data.photo != 'undefined' ? data.photo.toString('base64') : null;
    }
    if (data.lastname) curr.lastname = data.lastname;
    if (data.email) curr.email = data.email;
    if (typeof data.telegram_id !== 'undefined') curr.active = data.active;
    if (data.expiration_date || data.expiration_date === null)
      curr.expiration_date = data.expiration_date;
    const updated = await this.usersEntity.save(curr);
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

    const updated = await this.agentsEntity.update(
      {
        user: agentObj.user,
      },
      agentObj,
    );
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
    try {
      const created = await this.techsEntity.save({
        user,
        habilities,
        active: active ?? true,
        address,
        ci,
        province: p,
        municipality: m,
        confirmed: confirmed ?? true,
        confirmation_photo: confirmation_photo
          ? (confirmation_photo as any).toString('base64')
          : null,
        expiration_date: expiration_date
          ? moment(expiration_date).toDate()
          : null,
      });
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

    const updated = await this.techsEntity.update(
      {
        user: techObj.user,
      },
      techObj,
    );
  }

  async getUserPrivateData(username: string) {
    return await this.usersEntity.findOne({
      select: [
        'id',
        'name',
        'lastname',
        'username',
        'email',
        'phone_number',
        'telegram_id',
        'active',
        'expiration_date',
        'photo',
      ],
      relations: [
        'techniccian_info',
        'techniccian_info.habilities',
        'techniccian_info.province',
        'techniccian_info.municipality',
        'techniccian_info.habilities.group',
        'agent_info',
        'agent_info.role',
      ],
      where: { username },
    });
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
      qr.leftJoin(
        'tech.habilities',
        'hab',
      ).andWhere('hab.id in (:...habilities)', { habilities });
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
      (${loadUsers ? `agent.user isnull and tech.user isnull` : 'false'})
    )`);

    const results = await paginate_qr<UsersEntity>(page, page_size, qr);
    for (const u of results.data) {
      if (u.techniccian_info) {
        (u.techniccian_info as any).rating = Math.random() * (5 - 1) + 1;
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
}
