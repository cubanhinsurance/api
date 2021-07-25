import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
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
  namespace: 'clients',
})
export class ClientsIoService implements OnGatewayConnection {
  clients: Map<string, WsClient>;

  @WebSocketServer()
  server: Server;

  constructor(
    private jwt: JwtService,
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

      this.clients.set(client.id, {
        user: valid as any,
        ws: client,
      });
    } catch (e) {
      const b = 6;
    }
  }

  async emitTechConfirmation(data) {
    for (const id in this.clients) {
      const {
        user: { username: u },
        ws,
      } = this.clients[id];

      if (data.username == u) {
        (ws as Socket).send({
          type: 'tecjApplicantConfirmation',
          data,
        } as IoMessage);
        break;
      }
    }
  }
}
