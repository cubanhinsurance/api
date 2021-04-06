import { ConfigService } from '@atlasjs/config';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import * as moment from 'moment';
import { AgentsEntity } from 'src/modules/users/entities/agent.entity';
import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';

export interface USER_SIGN_INFO {
  username: string;
  agent?: AgentsEntity;
  tech?: TechniccianEntity;
  isRoot: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  isRoot(username: string) {
    try {
      return this.configService.config.ROOT_USER == username;
    } catch (e) {
      Logger.warn('Missing root user envars: ROOT_USER & ROOT_PASSWORD');
      return false;
    }
  }

  validateRoot(username: string, password: string) {
    const { config } = this.configService;
    try {
      return this.isRoot(username) && password == config.ROOT_PASSWORD;
    } catch (e) {
      Logger.warn('Missing root user envars: ROOT_USER & ROOT_PASSWORD');
      return false;
    }
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<USER_SIGN_INFO> {
    const { config } = this.configService;

    if (this.validateRoot(username, password)) {
      return {
        username,
        isRoot: true,
      };
    } else {
      const user = await this.usersService.findUserByUserName(username);
      if (!user) throw new UnauthorizedException();

      if (!user.active)
        throw new UnauthorizedException(`El usuario se encuentra inhabilitado`);

      if (
        user.expiration_date &&
        moment(user.expiration_date).isBefore(moment())
      ) {
        moment.locale('es');
        const exp = moment(user.expiration_date);
        throw new UnauthorizedException(
          `El usuario se encuentra inhabilitado debido a que ha expirado del tiempo de uso configurado: ${exp.format(
            'LLL',
          )} (${exp.fromNow()})`,
        );
      }

      if (!(await compare(password, user.password))) return;

      return {
        username: user.username,
        agent: user.agent_info,
        tech: user.techniccian_info,
        isRoot: false,
      };
    }
  }

  async validateAgent(
    username: string,
    password: string,
  ): Promise<USER_SIGN_INFO> {
    const userInfo = await this.validateUser(username, password);

    if (!userInfo) return;
    if (userInfo.isRoot) return userInfo;
    if (!userInfo.agent) return;
    if (!userInfo.agent.active)
      throw new UnauthorizedException(`El agente se encuentra inhabilitado`);

    if (
      userInfo.agent.expiration_date &&
      moment(userInfo.agent.expiration_date).isBefore(moment())
    ) {
      moment.locale('es');
      const exp = moment(userInfo.agent.expiration_date);
      throw new UnauthorizedException(
        `El agente se encuentra inhabilitado debido a que ha expirado del tiempo de uso configurado: ${exp.format(
          'LLL',
        )} (${exp.fromNow()})`,
      );
    }

    return userInfo;
  }

  async validateTech(username: string, password: string) {
    const userInfo = await this.validateUser(username, password);

    if (!userInfo) return;
    if (userInfo.isRoot) return userInfo;
    if (!userInfo.tech) return;
    if (!userInfo.tech.active)
      throw new UnauthorizedException(`El tecnico se encuentra inhabilitado`);

    if (
      userInfo.tech.expiration_date &&
      moment(userInfo.tech.expiration_date).isBefore(moment())
    ) {
      moment.locale('es');
      const exp = moment(userInfo.tech.expiration_date);
      throw new UnauthorizedException(
        `El tecnico se encuentra inhabilitado debido a que ha expirado del tiempo de uso configurado: ${exp.format(
          'LLL',
        )} (${exp.fromNow()})`,
      );
    }

    return userInfo;
  }

  async login(user: any) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }

  async getUserInfo(username: string) {
    if (this.isRoot(username)) return true;

    const user = await this.usersService.findUserByUserName(username);

    return user;
  }
}
