import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { IssuesCacheService } from 'src/modules/bussines/services/issues_cache.service';
import { UsersService } from 'src/modules/users/services/users.service';

class ValidTechLicense {
  constructor(private usersService: UsersService) {}

  async validTech(username: string) {
    const a = 7;
    return true;
  }
}

@Injectable()
export class WsValidTechLicense
  extends ValidTechLicense
  implements CanActivate {
  constructor(
    usersService: UsersService,
    private jwt: JwtService,
    private techsHandler: IssuesCacheService,
  ) {
    super(usersService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const connected = this.techsHandler.clients.get(client.id);

    //todo hay que ver que sea agente
    if (!connected) {
      Logger.warn(
        `Tecnico sin permisos: ${client.handshake.address}`,
        'Socket.IO',
      );
      Logger.log(data);
      return false;
    }

    client.user = connected.user;

    if (!(await this.validTech(connected.user.user.username))) {
      Logger.warn(
        `Tecnico sin licencia: ${client.handshake.address}`,
        'Socket.IO',
      );
      return false;
    }
    return true;
  }
}

@Injectable()
export class HttpValidTechLicense
  extends ValidTechLicense
  implements CanActivate {
  constructor(
    usersService: UsersService,
    private jwt: JwtService,
    private techsHandler: IssuesCacheService,
  ) {
    super(usersService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const {
      user: { username },
    } = context.switchToHttp().getRequest();

    if (!(await this.validTech(username))) {
      return false;
    }

    return true;
  }
}
