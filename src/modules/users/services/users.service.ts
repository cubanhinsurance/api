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
import { FindConditions, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { AgentDto, UserDto } from '../dtos/user.dto';
import { UsersEntity } from '../entities/user.entity';
import { compare, hash } from 'bcryptjs';
import { AgentsEntity } from '../entities/agent.entity';
import { TechniccianEntity } from '../entities/techniccian.entity';
import * as moment from 'moment';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity) private usersEntity: Repository<UsersEntity>,
    @InjectRepository(AgentsEntity)
    private agentsEntity: Repository<AgentsEntity>,
    @InjectRepository(TechniccianEntity)
    private techsEntity: Repository<TechniccianEntity>,
  ) {}

  async findUserByUserName(
    username: string,
    query?: FindConditions<UsersEntity>,
  ) {
    return await this.usersEntity.findOne({
      relations: ['techniccian_info', 'agent_info'],
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
        expiration_date: moment(expiration_date).toDate(),
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
}
