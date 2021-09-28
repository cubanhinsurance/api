import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  WsException,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
  IssuesEntity,
  ISSUE_STATE,
} from 'src/modules/bussines/entities/issues.entity';
import {
  IssueApplication,
  ISSUE_APPLICATION_STATE,
} from 'src/modules/bussines/entities/issues_applications.entity';
import {
  CLIENT_ISSUE_IN_PROGRESS_UPDATE,
  ISSUE_APPLICATION_CANCELLED,
  ISSUE_FINISHED,
  ISSUE_PAUSED,
  ISSUE_STARTED,
  NEW_ISSUE_APPLICATION,
  NEW_TECHAPPLICATION_CONFIRMATION,
  PENDENT_RATING,
  TECH_ARRIVED,
} from 'src/modules/bussines/io.constants';
import { ISSUES_APPLICATION_STATES } from 'src/modules/bussines/schemas/issues.schema';
import { IssuesService } from 'src/modules/bussines/services/issues.service';
import {
  IssuesCacheService,
  PENDENT_ISSUE,
} from 'src/modules/bussines/services/issues_cache.service';
import { TechApplicationsService } from 'src/modules/users/services/tech_applications.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { Repository } from 'typeorm';

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
  implements OnGatewayConnection, OnGatewayDisconnect
{
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
    @InjectRepository(IssuesEntity)
    private issuesRepo: Repository<IssuesEntity>,
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
      this.search4ProgressIssue(valid.username, client);
      this.search4PendentClientEvaluations(valid.username);
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
        (ws as Socket).emit(NEW_TECHAPPLICATION_CONFIRMATION, data);
        break;
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
  }

  async search4ProgressIssue(author: string, ws: Socket) {
    const progressIssues = await this.issuesService
      .getAuthorIssuesQr(author)
      .andWhere('i.state in (:...progress)', {
        progress: [ISSUE_STATE.TRAVELING, ISSUE_STATE.PROGRESS],
      })
      .addSelect(['tech.username'])
      .getMany();

    for (const {
      id,
      tech: { username: tech },
    } of progressIssues) {
      const techClient = this.issuesCache.findTechClient(tech);
      if (!techClient) continue;
      if (techClient.client.progress?.issue?.id != id) continue;
      this.issueUpdate(techClient.client.progress);
      const b = 7;
    }
    const g = 7;
  }

  async search4AuthorIssuesApplications(username: string) {
    const apps = await this.issuesService.getUserIssuesApplications(
      username,
      ISSUE_APPLICATION_STATE.PENDENT,
    );
    const techsInfo = {};
    for (const { issue, ...app } of apps) {
      if (!(app.tech.username in techsInfo)) {
        const { info, review } = await this.issuesService.getTechInfo(
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

  issueUpdate({
    issue,
    tech,
    refresh_date,
    arrive_date,
    distance: { distance, linearDistance, duration },
    application,
  }: PENDENT_ISSUE) {
    const clientConn = this.clients.get(issue?.user?.username);

    if (clientConn) {
      clientConn.ws.emit(CLIENT_ISSUE_IN_PROGRESS_UPDATE, {
        issue,
        tech,
        application,
        arrive: {
          duration,
          distance,
          linearDistance,
          refresh_date,
          arrive_date,
        },
      });
    }
  }

  async search4PendentClientEvaluations(username: string, issue?: number) {
    const qr = this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'author')
      .innerJoin('i.tech', 'tech')
      .leftJoin('i.evaluations', 'evals')
      .leftJoin('evals.from', 'fr')
      .leftJoin('evals.to', 'to')
      .where('i.state=:completed', {
        completed: ISSUE_STATE.COMPLETED,
      })
      .andWhere('author.username=:username', { username })
      .andWhere('evals.id isnull');

    if (typeof issue != 'undefined') {
      qr.andWhere('i.id=:issue', { issue });
    }

    const issues = await qr.getMany();

    if (issues.length == 0) return;

    const clientConn = this.clients.get(username);

    if (!clientConn) return;

    for (const { id } of issues) {
      const issueDetails = await this.issuesService.getIssueDetails(id);
      clientConn.ws.emit(PENDENT_RATING, issueDetails);
    }

    const b = 7;
  }

  issuePaused(issue: IssuesEntity) {
    const clientConn = this.clients.get(issue?.user?.username);

    if (clientConn) {
      clientConn.ws.emit(ISSUE_PAUSED, issue);
    }
  }

  issueArrived(issue: IssuesEntity) {
    const clientConn = this.clients.get(issue?.user?.username);

    if (clientConn) {
      clientConn.ws.emit(TECH_ARRIVED, issue);
    }
  }

  issueFinished(issue: IssuesEntity) {
    const clientConn = this.clients.get(issue?.user?.username);

    if (clientConn) {
      clientConn.ws.emit(ISSUE_FINISHED, issue);

      this.search4PendentClientEvaluations(issue?.user?.username, issue.id);
    }
  }
}
