import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  WsException,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
  NEW_TECHAPPLICATION,
  TECH_APPLICANT_CANCELLED,
} from 'src/modules/bussines/io.constants';
import { TechApplicationsService } from 'src/modules/users/services/tech_applications.service';

export interface WsClient {
  ws: Socket;
  user: any;
}

export interface IoMessage {
  type: string;
  data: any;
}

@Injectable()
@WebSocketGateway({
  namespace: '/agents',
})
export class AgentsIoService
  implements OnGatewayConnection, OnGatewayDisconnect {
  clients: Map<string, WsClient>;

  @WebSocketServer()
  server: Server;

  constructor(
    private jwt: JwtService,
    @Inject('BROKER') private broker: ClientProxy,
    private techApplicants: TechApplicationsService,
  ) {
    this.clients = new Map<string, any>();
  }

  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.query?.Authorization;

      const valid = auth ? await this.jwt.verify(auth as any) : false;

      if (!valid) {
        Logger.warn(
          `Cliente sin permisos: ${client.handshake.address}`,
          'Socket.IO',
        );
        client.disconnect(true);
        throw new WsException('unauthorized');
      }

      Logger.log(
        `Agente conectado: ${valid.username} - ${client.handshake.address}`,
      );
      this.clients.set(client.id, {
        user: valid as any,
        ws: client,
      });
    } catch (e) {
      const b = 6;
    }
  }

  async emitNewTechApp(techApp) {
    for (const [id, { ws }] of this.clients) {
      ws.emit(NEW_TECHAPPLICATION, {
        app: techApp,
        count: await this.techApplicants.getApplicantsCount(),
      });
    }
  }

  async emitTechAppCancelled(techApp) {
    for (const [id, { ws }] of this.clients) {
      ws.emit(TECH_APPLICANT_CANCELLED, {
        app: techApp,
        count: await this.techApplicants.getApplicantsCount(),
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
  }
}
