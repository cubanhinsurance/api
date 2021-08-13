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
import { ValidTechLicense } from 'src/modules/auth/guards/activeTech.guard';
import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { IssuesTypesEntity } from 'src/modules/enums/entities/issues_types.entity';
import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { TechApplicationsService } from 'src/modules/users/services/tech_applications.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { IoMessage, WsClient } from './clients_io.service';

export enum TRANSPORT_PROFILE {
  FOOT = 'foot',
  BICYCLE = 'bicycle',
  CAR = 'car',
}

export interface TECH_STATUS_UPDATE {
  available?: boolean;
  gps?: {
    x: number;
    y: number;
  };
  profile?: TRANSPORT_PROFILE;
  maxDistance?: number;
}

export interface AvailableTech {
  user: TechniccianEntity;
  status: TECH_STATUS_UPDATE;
}

export interface ClientIndex {
  ws: Socket;
  user: TechniccianEntity;
}

@Injectable()
@WebSocketGateway({
  namespace: '/techs',
})
export class TechsIoService
  implements OnGatewayConnection, OnGatewayDisconnect {
  clients: Map<string, WsClient>;
  availableTechs: Map<string, TECH_STATUS_UPDATE>;

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('BROKER') private broker: ClientProxy,
    private jwt: JwtService,
    private usersService: UsersService,
  ) {
    this.clients = new Map<string, WsClient>();
    this.availableTechs = new Map<string, TECH_STATUS_UPDATE>();
  }

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
        client.disconnect(true);
        throw new WsException('unauthorized');
      }

      const user = await this.usersService.getTechnichianInfo(valid.username);

      this.clients.set(client.id, {
        user,
        ws: client,
      });

      Logger.log(
        `Tecnico conectado: ${valid.username} - ${client.handshake.address}`,
      );
    } catch (e) {}
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
  }

  @UseGuards(ValidTechLicense)
  @SubscribeMessage('available')
  async handleAvailable(
    @ConnectedSocket() client: Socket,
    @MessageBody() status: TECH_STATUS_UPDATE,
  ) {
    if (!status.available) {
      this.availableTechs.delete(client.id);
      return;
    }

    this.updateTechStatus(client.id, status);
  }

  getTechUser(id: string) {
    return this.clients.get(id)?.user;
  }

  updateTechStatus(id: string, status: TECH_STATUS_UPDATE) {
    let tech = this.availableTechs.get(id);
    if (!tech && !status.available) return;
    this.availableTechs.set(id, status);
  }

  @UseGuards(ValidTechLicense)
  @SubscribeMessage('gps')
  async handleGps(
    @ConnectedSocket() client: Socket,
    @MessageBody() status: TECH_STATUS_UPDATE,
  ) {
    this.updateTechStatus(client.id, status);
  }

  isPrepared(tech: TechniccianEntity, { rules }: IssuesTypesEntity): boolean {
    if (!rules || rules?.length == 0 || rules?.[0]?.length == 0) return true;

    const [ors] = rules;

    return !!tech.habilities.find(
      (h: HabilitiesEntity) => !!ors.find((id) => id == h.id),
    );
    const a = 6;
  }

  async *getAvailableTechsByRules(issue: IssuesTypesEntity) {
    const max = 200;

    let res = [];
    for (const [id, data] of this.availableTechs) {
      const { user, ws } = this.clients.get(id);

      if (!this.isPrepared(user, issue)) continue;

      const b = 7;
    }

    const a = 7;
  }
}
