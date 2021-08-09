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
import { TechApplicationsService } from 'src/modules/users/services/tech_applications.service';
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
  user: any;
  status: TECH_STATUS_UPDATE;
}

@Injectable()
@WebSocketGateway({
  namespace: '/techs',
  //path: 'techs',
})
export class TechsIoService
  implements OnGatewayConnection, OnGatewayDisconnect {
  clients: Map<string, WsClient>;
  availableTechs: Map<string, AvailableTech>;

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('BROKER') private broker: ClientProxy,
    private jwt: JwtService,
  ) {
    this.clients = new Map<string, any>();
    this.availableTechs = new Map<string, AvailableTech>();
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

      this.clients.set(client.id, {
        user: valid as any,
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
    const tech = this.availableTechs.get(id);
    if (!tech) return;
    tech.status = status;
  }

  @UseGuards(ValidTechLicense)
  @SubscribeMessage('gps')
  async handleGps(
    @ConnectedSocket() client: Socket,
    @MessageBody() status: TECH_STATUS_UPDATE,
  ) {
    this.updateTechStatus(client.id, status);
  }

  
}
