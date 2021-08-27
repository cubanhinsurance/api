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
import { IssuesEntity } from 'src/modules/bussines/entities/issues.entity';
import { IssueApplication } from 'src/modules/bussines/entities/issues_applications.entity';
import {
  ISSUE_APPLICATION_CANCELLED,
  NEW_ISSUE_APPLICATION,
} from 'src/modules/bussines/io.constants';
import { IssuesService } from 'src/modules/bussines/services/issues.service';
import { IssuesCacheService } from 'src/modules/bussines/services/issues_cache.service';
import { TechApplicationsService } from 'src/modules/users/services/tech_applications.service';
import { UsersService } from 'src/modules/users/services/users.service';

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
  namespace: '/clients',
})
export class ClientsIoService
  implements OnGatewayConnection, OnGatewayDisconnect {
  clients: Map<string, WsClient>;

  usersIndex: Record<string, string>;

  @WebSocketServer()
  server: Server;

  constructor(
    private jwt: JwtService,
    @Inject('BROKER') private broker: ClientProxy,
    private techApplicants: TechApplicationsService,
    private issuesCache: IssuesCacheService,
    private usersService: UsersService,
    private issuesService: IssuesService,
  ) {
    this.clients = new Map<string, any>();
    this.usersIndex = {};
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
        `Cliente conectado: ${valid.username} - ${client.handshake.address}`,
      );
      this.clients.set(valid.username, {
        user: valid as any,
        ws: client,
      });

      this.search4AuthorIssuesApplications(valid.username);
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
          type: 'techApplicantConfirmation',
          data,
        } as IoMessage);
        break;
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
  }

  async search4AuthorIssuesApplications(username: string) {
    const apps = await this.issuesService.getUserIssuesApplications(username);
    const techsInfo = {};
    for (const { issue, ...app } of apps) {
      if (!(app.tech.username in techsInfo)) {
        const info = await this.usersService.getUserPrivateData(
          app.tech.username,
        );
        const review = await this.usersService.getTechniccianReview(
          app.tech.username,
        );
        (info.techniccian_info as any).review = review;
        techsInfo[app.tech.username] = info;
      }
      app.tech = techsInfo[app.tech.username];
      this.newIssueApplication(issue, app as IssueApplication);
    }
    const a = 7;
  }

  async newIssueApplication(issue: IssuesEntity, app: IssueApplication) {
    const clientConn = this.clients.get(issue.user.username);

    if (clientConn) {
      if (!(app.tech.techniccian_info as any).review) {
        const reviews = await this.usersService.getTechniccianReview(
          app.tech.username,
        );
        (app.tech.techniccian_info as any).review = reviews;
      }
      clientConn.ws.emit(NEW_ISSUE_APPLICATION, { ...app, issue });
    }
  }

  async issueApplicationCancelled(app: IssueApplication) {
    const clientConn = this.clients.get(app?.issue?.user?.username);

    if (clientConn) {
      clientConn.ws.emit(ISSUE_APPLICATION_CANCELLED, app);
    }
  }
}
