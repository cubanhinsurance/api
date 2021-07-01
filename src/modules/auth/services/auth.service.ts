import { ConfigService } from '@atlasjs/config';
import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import * as moment from 'moment';
import { AgentsEntity } from 'src/modules/users/entities/agent.entity';
import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { RolesService } from 'src/modules/roles/services/roles.service';
import { FunctionalitiesService } from 'src/modules/functionalities/services/functionalities.service';

export interface USER_SIGN_INFO {
  username: string;
  agent?: AgentsEntity;
  tech?: TechniccianEntity;
  isRoot: boolean;
  confirmed?: boolean;
}

export interface USER_INFO {
  name: string;
  lastname?: string;
  isRoot: boolean;
  id: number;
  photo?: string;
  isTech: boolean;
  isAgent: boolean;
  username: string;
  confirmed?: boolean;
  tools: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private functionalitiesService: FunctionalitiesService,
    private rolesService: RolesService,
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

      // if (!user.confirmed)
      //   throw new ForbiddenException('El usuario necesita confirmarse');

      if (!user.active)
        throw new UnauthorizedException(`El usuario se encuentra inhabilitado`);

      if (
        user.expiration_date &&
        moment(user.expiration_date).isAfter(moment())
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
        confirmed: user.confirmed,
        isRoot: false,
      };
    }
  }

  async sendVerificationEmail(username: string, email: string) {
    return await this.usersService.sendVerificationEmail(username, email);
  }
  async verifyUserConfirmationCode(username: string, code: string) {
    return await this.usersService.confirmUser(username, code);
  }

  private checkAgent(userInfo: any) {
    if (!userInfo) return;
    if (userInfo.isRoot) return userInfo;
    if (!userInfo.agent) return;
    if (!userInfo.agent.active)
      throw new UnauthorizedException(`El agente se encuentra inhabilitado`);

    if (
      userInfo.agent.expiration_date &&
      moment(userInfo.agent.expiration_date).isAfter(moment())
    ) {
      moment.locale('es');
      const exp = moment(userInfo.agent.expiration_date);
      throw new UnauthorizedException(
        `El agente se encuentra inhabilitado debido a que ha expirado del tiempo de uso configurado: ${exp.format(
          'LLL',
        )} (${exp.fromNow()})`,
      );
    }

    return true;
  }

  async validateAgent(
    username: string,
    password: string,
  ): Promise<USER_SIGN_INFO> {
    const userInfo = await this.validateUser(username, password);

    this.checkAgent(userInfo);

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
      moment(userInfo.tech.expiration_date).isAfter(moment())
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
      expires_in: this.configService.config.auth.expiresIn,
    };
  }

  async getAllTools() {
    return (await this.functionalitiesService.getFunctionalitiesList()).map(
      (f) => f.id,
    );
  }

  async getUserInfo(username: string): Promise<USER_INFO> {
    if (this.isRoot(username))
      return {
        isRoot: false,
        id: -1,
        isAgent: false,
        isTech: false,
        name: 'Root',
        username,
        tools: await this.getAllTools(),
      };

    const {
      name,
      lastname,
      agent_info,
      techniccian_info,
      id,
      username: user,
      photo,
      confirmed,
    } = await this.usersService.findUserByUserName(username);

    let isAgent = !!agent_info;
    let agentError = null;
    let tools = [];

    if (isAgent) {
      try {
        isAgent = !!this.checkAgent({
          username: username,
          agent: agent_info,
          tech: techniccian_info,
          isRoot: false,
        });
      } catch (e) {
        isAgent = false;
      }

      if (isAgent) {
        tools = agent_info.role.root
          ? await this.getAllTools()
          : agent_info.role.functionalities.map((f) => f.id);
      }
    }

    return {
      name,
      username,
      lastname,
      isRoot: false,
      id,
      photo,
      confirmed,
      isTech: !!techniccian_info,
      isAgent,
      tools,
    };
  }
}
