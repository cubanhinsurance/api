import { Inject, Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  WsException,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WsValidTechLicense } from 'src/modules/auth/guards/activeTech.guard';
import { IssuesEntity } from 'src/modules/bussines/entities/issues.entity';
import { IssueApplication } from 'src/modules/bussines/entities/issues_applications.entity';
import { IssuesService } from 'src/modules/bussines/services/issues.service';
import {
  IssuesCacheService,
  TECH_STATUS_UPDATE,
} from 'src/modules/bussines/services/issues_cache.service';
import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { IssuesTypesEntity } from 'src/modules/enums/entities/issues_types.entity';
import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { TechApplicationsService } from 'src/modules/users/services/tech_applications.service';
import { UsersService } from 'src/modules/users/services/users.service';

export interface ClientIndex {
  ws: Socket;
  user: TechniccianEntity;
}

export interface WsTech {
  ws: Socket;
  reviews: any;
  user: TechniccianEntity;
}

@Injectable()
@WebSocketGateway({
  namespace: '/techs',
})
export class TechsIoService
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwt: JwtService,
    private techsHandler: IssuesCacheService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.query?.Authorization;

      const valid = auth ? await this.jwt.verify(auth as any) : false;

      //todo hay que ver que sea agente
      if (!valid) {
        Logger.warn(
          `Tecnico sin permisos: ${client.handshake.address}`,
          'Socket.IO',
        );
        throw new WsException('unauthorized');
        client.disconnect(true);
      }

      const connected = await this.techsHandler.techConnected(
        valid.username,
        client,
      );

      if (connected === false) {
        client.emit('unauthorized_tech');
        client.disconnect();
      }

      client.emit('CONNECTED', true);
      const a = 7;
      Logger.log(
        `Tecnico conectado: ${valid.username} - ${client.handshake.address}`,
      );
    } catch (e) {
      if (e?.message == 'jwt expired' || e?.name == 'TokenExpiredError') {
        client.emit('unauthorized');
        client.disconnect();
      }
      const a = 7;
    }
  }

  handleDisconnect(client: Socket) {
    Logger.warn(`Tecnico disconnected: ${client.id}`);
    this.techsHandler.techDisconnected(client);
  }

  @UseGuards(WsValidTechLicense)
  @SubscribeMessage('available')
  async handleAvailable(
    @ConnectedSocket() client: Socket,
    @MessageBody() status: TECH_STATUS_UPDATE,
  ) {
    if (!status.available) {
      Logger.warn(`Tecnico unavailable: ${client.id}`);
      this.techsHandler.techUnavailable(client);
      return;
    }

    Logger.log(`Tecnico available: ${client.id} (${client.handshake.address})`);
    this.techsHandler.techAvailable(client.id, status);
  }

  getTechUser(id: string) {
    return this.techsHandler.getTechUser(id);
  }

  @UseGuards(WsValidTechLicense)
  @SubscribeMessage('gps')
  async handleGps(
    @ConnectedSocket() client: Socket,
    @MessageBody() status: TECH_STATUS_UPDATE,
  ) {
    this.techsHandler.updateTechStatus(client.id, status);
  }

  async issueCreated(data) {
    this.techsHandler.issueCreated(data);
  }

  async issueCancelled(data) {
    this.techsHandler.issueCancelled(data);
  }

  async newApplication(app) {
    this.techsHandler.newApplication(app);
  }

  async techRejected(app) {
    this.techsHandler.techRejected(app);
  }

  async techAccepted(app) {
    this.techsHandler.techAccepted(app);
  }

  async issueInProgress(app) {
    this.techsHandler.issueInProgress(app);
  }
}
