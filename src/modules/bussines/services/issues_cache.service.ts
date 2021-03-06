import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IssuesEntity,
  ISSUE_STATE,
} from 'src/modules/bussines/entities/issues.entity';
import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { Socket } from 'socket.io';
import { ClientProxy } from '@nestjs/microservices';
import { IssuesTypesEntity } from 'src/modules/enums/entities/issues_types.entity';
import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { GisService } from 'src/modules/gis/services/gis.service';
import { distance, point } from '@turf/turf';
import { OsrmService, Point, PROFILE } from 'src/modules/osrm/src/osrm.service';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  IssueApplication,
  ISSUE_APPLICATION_STATE,
} from 'src/modules/bussines/entities/issues_applications.entity';
import {
  CLIENT_ISSUE_IN_PROGRESS_UPDATE,
  ISSUE_CANCELLED,
  ISSUE_CREATED,
  ISSUE_FINISHED,
  ISSUE_IN_PROGRESS,
  ISSUE_UNAVAILABLE,
  NEW_ISSUE_APPLICATION,
  PENDENT_RATING,
  TECH_ACCEPTED,
  TECH_ISSUE_IN_PROGRESS_UPDATE,
  TECH_RATED,
  TECH_REJECTED,
} from 'src/modules/bussines/io.constants';
import { IssuesService } from './issues.service';
import { IgnoredIssuesEntity } from '../entities/ignored_issues.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { application } from 'express';
import * as moment from 'moment';
import { UsersEntity } from 'src/modules/users/entities/user.entity';
import { RatingsEntity } from '../entities/ratings.entity';

export interface WsClient {
  ws: Socket;
  user: any;
}

export interface IoMessage {
  type: string;
  data: any;
}

type Techs = Map<string, DISTANCE_INFO>;

export interface OPEN_ISSUES {
  issue: IssuesEntity;
  techs: Techs;
  applications: Techs;
}

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

export interface AVAILABLE_FOR_ISSUE_INFO {
  technichian: any;
  travel: TECH_DISTANCE_INFO;
}

export interface TECH_DISTANCE_INFO {}

export interface ProgressIsue {}

export interface WsTech {
  ws: Socket;
  reviews: any;
  user: TechniccianEntity;
  pendents: Map<number, PENDENT_ISSUE>;
  progress?: PENDENT_ISSUE;
}

export interface DISTANCE_INFO {
  id: string;
  tech: TechniccianEntity;
  status: TECH_STATUS_UPDATE;
  distance: number;
  duration?: number;
  reviews?: any;
  linearDistance: number;
  route?: any;
}

export interface PENDENT_ISSUE {
  refresh_date?: Date;
  arrive_date?: Date;
  issue: IssuesEntity;
  distance: DISTANCE_INFO;
  tech: TechniccianEntity;
  status: TECH_STATUS_UPDATE;
  application: IssueApplication;
}

const DEFAULT_MIN_ROUTE_DISTANCE = 200;

@Injectable()
export class IssuesCacheService {
  clients: Map<string, WsTech>;
  availableTechs: Map<string, TECH_STATUS_UPDATE>;
  openIssues: Map<number, OPEN_ISSUES>;
  openIssuesClients: Map<string, Set<number>>;

  constructor(
    @Inject('BROKER') private broker: ClientProxy,
    private usersService: UsersService,
    private gisService: GisService,
    private osrmService: OsrmService,
    @InjectRepository(IgnoredIssuesEntity)
    private ignoredIssuesRepo: Repository<IgnoredIssuesEntity>,
    @InjectRepository(IssueApplication)
    private issuesAppRepo: Repository<IssueApplication>,
    @InjectRepository(IssuesEntity)
    private issuesRepo: Repository<IssuesEntity>,
    @InjectEntityManager() private manager,
  ) {
    this.openIssues = new Map<number, OPEN_ISSUES>();
    this.openIssuesClients = new Map<string, Set<number>>();
    this.clients = new Map<string, WsTech>();
    this.availableTechs = new Map<string, TECH_STATUS_UPDATE>();
  }

  get issuesQr(): SelectQueryBuilder<IssuesEntity> {
    return this.issuesRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.client_location', 'client_location')
      .leftJoinAndSelect('client_location.province', 'province')
      .leftJoinAndSelect('client_location.municipality', 'prmunicipalityovince')
      .innerJoin('i.user', 'u')
      .innerJoinAndSelect('i.type', 'issuetype')
      .leftJoin('i.tech', 'tu')
      .leftJoin('tu.techniccian_info', 'tt')
      .addSelect([
        'tu.username',
        'tu.name',
        'tu.lastname',
        'tu.phone_number',
        'u.username',
        'u.name',
        'u.lastname',
        'u.phone_number',
      ]);
  }

  async techConnected(username: string, client: Socket) {
    const user = await this.usersService.getTechnichianInfo(username);
    const reviews = await this.usersService.getTechniccianReview(username);

    if (!user) {
      Logger.warn(
        `Intento de conexion al socket por un usuario que no es tecnico: ${username}`,
      );
      return false;
    }
    this.clients.set(client.id, {
      user,
      reviews,
      ws: client,
      pendents: new Map<number, PENDENT_ISSUE>(),
    });

    this.search4PendentEvaluations(client, username);
  }

  async getTechPendentIssues(tech: string) {
    // return await this.issuesQr
    //   .where('i.state=:accepted and tu.username=:tech', {
    //     accepted: ISSUE_STATE.ACCEPTED,
    //     tech,
    //   })
    //   .getMany();
  }

  techDisconnected(client: Socket) {
    this.techUnavailable(client);
    this.clients.delete(client.id);
    //todo emitir evento desconectado
  }

  techUnavailable(client: Socket) {
    this.availableTechs.delete(client.id);

    const clientObj = this.clients.get(client.id);
    if (!clientObj) return;
    const { user, ws } = clientObj;
    this.unRegisterTechFromOppendIssues(user.user.username);
  }

  async techAvailable(id: string, status: TECH_STATUS_UPDATE) {
    const first = !this.availableTechs.get(id);
    this.updateTechStatus(id, status);

    const { user, ws, reviews } = this.clients.get(id);

    const anotherAv = this.findTechClient(user.user.username);

    if (!!anotherAv && anotherAv.id != id) {
      Logger.warn(
        `Usuario ${user.user.username} con mas de un socket en servicio`,
      );
      return;
    }

    if (first) {
      this.search4OpenIssues(id, user, status);
      this.search4PendentIssues(user);
      this.search4ProgressIssue(user);
    }
  }

  async search4PendentEvaluations(
    ws: Socket,
    username: string,
    issue?: number,
  ) {
    const qr = this.issuesRepo
      .createQueryBuilder('i')
      .innerJoin('i.user', 'author')
      .innerJoin('i.tech', 'tech')
      .leftJoinAndSelect('i.client_location', 'cl')
      .innerJoinAndSelect('i.type', 'issuetype')
      .leftJoinAndSelect('i.evaluations', 'evals')
      .leftJoinAndSelect('i.client_location', 'client_location')
      .leftJoinAndSelect('client_location.province', 'province')
      .leftJoinAndSelect('client_location.municipality', 'prmunicipalityovince')
      .leftJoin('evals.from', 'fr')
      .leftJoin('evals.to', 'to')
      .leftJoinAndSelect('i.traces', 'traces')
      .where('i.state=:completed', {
        completed: ISSUE_STATE.COMPLETED,
      })
      .andWhere('tech.username=:username', { username })
      .andWhere('evals.id isnull')
      .addSelect(['fr.username', 'to.username'])
      .addSelect([
        'tech.username',
        'tech.name',
        'tech.lastname',
        'tech.phone_number',
      ])
      .addSelect([
        'author.username',
        'author.name',
        'author.lastname',
        'author.phone_number',
      ]);

    if (typeof issue != 'undefined') {
      qr.andWhere('i.id=:issue', { issue });
    }

    const issues = await qr.getMany();

    if (issues.length == 0) return;

    for (const i of issues) {
      const already = i.evaluations.find(
        ({ from: { username: u } }) => u == username,
      );
      if (already) continue;
      ws.emit(PENDENT_RATING, i);
    }
  }

  async search4OpenIssues(
    id: string,
    user: TechniccianEntity,
    status: TECH_STATUS_UPDATE,
  ) {
    for (const [issueId, { issue, techs, applications }] of this.openIssues) {
      if (!!techs.get(user.user.username)) continue;
      if (!!applications.get(user.user.username)) continue;
      if (!(await this.isPrepared(user, issue))) continue;
      const distanceInfo = await this.distanceInfo(id, user, status, issue);
      if (!distanceInfo) {
        Logger.error(
          'Ocurrio un error obteniendo la informacion de distancia de un tecnico recien conectado',
          'IssuesCache',
        );
        continue;
      }
      this.registerTech2OpennedIssue(issueId, distanceInfo);
    }
  }

  async search4PendentIssues(tech: TechniccianEntity) {
    const pendents = await this.issuesQr
      .innerJoinAndSelect('i.applications', 'apps', 'apps.tech=tu.id')
      .where('tu.username=:tech and i.state=:accepted', {
        tech: tech.user.username,
        accepted: ISSUE_STATE.ACCEPTED,
      })
      .getMany();

    for (const {
      tech: t,
      applications: [application],
      ...issue
    } of pendents) {
      this.techAccepted({
        application,
        issue: issue as any,
        refused: [],
        tech,
      });
    }
    const f = 7;
  }

  async search4ProgressIssue(tech: TechniccianEntity) {
    const issue = await this.issuesQr
      .leftJoinAndSelect('i.traces', 'traces')
      .where('tu.username=:tech and i.state in (:...state)', {
        tech: tech.user.username,
        state: [ISSUE_STATE.TRAVELING, ISSUE_STATE.PROGRESS],
      })
      .getOne();

    if (!issue) return;

    if (issue.state == ISSUE_STATE.TRAVELING) {
      this.issueOnTheWay({ issue, tech: tech.user.username });
    } else {
      this.issueInProgress(issue);
    }
    const b = 7;
  }

  getTechUser(id: string) {
    return this.clients.get(id)?.user;
  }

  updateTechStatus(id: string, status: TECH_STATUS_UPDATE) {
    let tech = this.availableTechs.get(id);
    if (!tech && !status.available) return;
    const old = tech;
    this.availableTechs.set(id, status);
    this.refreshProgressIssueInfo(id, old);
  }

  async getIssue(id: number) {
    const cached = this.openIssues.get(id);
    if (!!cached) return cached;
  }

  async isPrepared(
    tech: TechniccianEntity,
    issue: IssuesEntity,
  ): Promise<boolean> {
    const ignored = await this.ignoredIssuesRepo
      .createQueryBuilder('ig')
      .innerJoin('ig.user', 'u')
      .innerJoin('ig.issue', 'i')
      .where('u.username=:username and i.id=:issue', {
        username: tech.user.username,
        issue: issue.id,
      })
      .getOne();

    if (!!ignored) return false;

    const alreadyApplied = await this.issuesAppRepo
      .createQueryBuilder('ia')
      .innerJoin('ia.issue', 'i')
      .innerJoin('ia.tech', 'tech')
      .where('tech.username=:username and i.id=:issue', {
        username: tech.user.username,
        issue: issue.id,
      })
      .getOne();

    if (!!alreadyApplied) return false;

    const {
      type: { rules },
    } = issue;
    if (!rules || rules?.length == 0 || rules?.[0]?.length == 0) return true;

    const [ors] = rules;

    let prepared = !!tech.habilities.find(
      (h: HabilitiesEntity) => !!ors.find((id) => id == h.id),
    );

    if (!prepared) return false;

    return true;
  }

  async isCloseEnough(
    tech: TechniccianEntity,
    { client_location: { geom }, max_distance }: IssuesEntity,
    status: TECH_STATUS_UPDATE,
  ): Promise<TECH_DISTANCE_INFO | false> {
    const { hasLocation, location } = this.getTechLocation(tech, status);

    const ldistance = distance(location, geom, { units: 'meters' });
    try {
      const {
        routes: [{ distance, duration }],
      } = await this.osrmService.route(
        location,
        geom,
        status.profile == TRANSPORT_PROFILE.BICYCLE
          ? PROFILE.BIKE
          : status.profile == TRANSPORT_PROFILE.CAR
          ? PROFILE.CAR
          : PROFILE.FOOT,
      );
      const b = 6;
    } catch (e) {
      return false;
    }

    return false;
  }

  getTechLocation(
    tech: TechniccianEntity,
    { gps: { x: gx, y: gy } }: TECH_STATUS_UPDATE,
  ): {
    hasLocation: boolean;
    location: Point;
  } {
    const hasLocation = !!gx;
    return {
      hasLocation,
      location: hasLocation
        ? point([gx, gy]).geometry
        : this.gisService.getMunicipalityCentroid(tech.municipality.id),
    };
  }

  async getAvailableInfo(
    tech: TechniccianEntity,
    issue: IssuesEntity,
    status: TECH_STATUS_UPDATE,
  ): Promise<AVAILABLE_FOR_ISSUE_INFO | false> {
    if (!(await this.isPrepared(tech, issue))) return false;
    const travelInfo = await this.isCloseEnough(tech, issue, status);
    if (!travelInfo) return false;
    return {
      technichian: tech,
      travel: await this.isCloseEnough(tech, issue, status),
    };
  }

  async getPreparedTechs(issue: IssuesEntity) {
    const res = [];
    for (const [id, data] of this.availableTechs) {
      if (!this.clients.has(id)) continue;
      const { user, ws, reviews } = this.clients.get(id);
      if (await this.isPrepared(user, issue))
        res.push({
          id,
          data,
          reviews,
          user,
        });
    }
    return res;
  }

  async getRoute(
    tech: TechniccianEntity,
    status: TECH_STATUS_UPDATE,
    { client_location: { geom } }: IssuesEntity,
  ) {
    const { hasLocation, location } = this.getTechLocation(tech, status);
    try {
      return await this.osrmService.route(
        location,
        geom,
        status.profile == TRANSPORT_PROFILE.BICYCLE
          ? PROFILE.BIKE
          : status.profile == TRANSPORT_PROFILE.CAR
          ? PROFILE.CAR
          : PROFILE.FOOT,
      );
    } catch (e) {
      return null;
    }
  }

  getLinearDistance(
    tech: TechniccianEntity,
    status: TECH_STATUS_UPDATE,
    { max_distance, max_techs, client_location: { geom } }: IssuesEntity,
  ) {
    const { hasLocation, location } = this.getTechLocation(tech, status);

    return distance(location, geom, { units: 'meters' });
  }

  findTech(tech: string) {
    for (const [
      id,
      {
        user: {
          user: { username },
        },
      },
    ] of this.clients) {
      if (username != tech || !this.availableTechs.get(id)) continue;
      return id;
    }
    return false;
  }

  async getIssueTechDistanceInfo(issue: IssuesEntity, tech: string) {
    const client = this.findTech(tech);

    if (!client) return false;

    const available = this.availableTechs.get(client);

    if (!available) return false;

    const connection = this.clients.get(client);

    const dt = await this.distanceInfo(
      client,
      connection.user,
      available,
      issue,
    );

    return dt
      ? {
          route: dt.route,
          distance: dt.distance,
          linearDistance: dt.linearDistance,
          duration: dt.duration,
        }
      : false;
  }

  async distanceInfo(
    id: string,
    tech: TechniccianEntity,
    status: TECH_STATUS_UPDATE,
    issue: IssuesEntity,
  ): Promise<DISTANCE_INFO> {
    if (tech.province.id != issue.client_location.province.id) {
      return null;
    }

    const linearDistance = this.getLinearDistance(tech, status, issue);
    if (
      status.maxDistance != undefined &&
      linearDistance > status.maxDistance + 1000
    ) {
      return null;
    }

    const route = await this.getRoute(tech, status, issue);

    let distance = linearDistance;
    let duration = null;
    if (route?.routes?.[0]) {
      distance = route?.routes?.[0].distance;
      duration = route?.routes?.[0].duration;
    }

    return {
      id,
      tech,
      status,
      distance,
      duration,
      reviews: this.clients.get(id)?.reviews,
      linearDistance,
      route,
    };
  }

  async getClosests2Issue(
    issue: IssuesEntity,
    preparedTechs: any[],
  ): Promise<DISTANCE_INFO[]> {
    const distances = (
      (await Promise.all(
        preparedTechs.map(({ id, data, user }) => {
          return this.distanceInfo(id, user, data, issue);
        }),
      )) as any[]
    ).filter((v) => !!v);

    const { max_distance, max_techs } = issue;

    return distances;
  }

  async registerTech2OpennedIssue(issue: number, tech: DISTANCE_INFO) {
    const { techs, issue: i } = this.openIssues.get(issue);

    techs.set(tech.tech.user.username, tech);

    const client = this.clients.get(tech.id);
    if (!client) return;

    client.ws.emit(ISSUE_CREATED, {
      distance: tech.distance,
      duration: tech.duration,
      linearDistance: tech.linearDistance,
      route: tech.route,
      issue: i,
    });
  }

  async unRegisterTechFromOppendIssues(username: string, cause?: string) {
    for (const [issueId, { issue, techs }] of this.openIssues) {
      if (!techs.get(username)) continue;
      techs.delete(username);
    }
  }

  async issueCreated(issue: IssuesEntity) {
    this.openIssues.set(issue.id, {
      issue,
      techs: new Map<string, DISTANCE_INFO>(),
      applications: new Map<string, DISTANCE_INFO>(),
    });

    const author = issue.user.username;
    let set = this.openIssuesClients.get(author);
    if (!set) {
      this.openIssuesClients.set(author, new Set<number>());
      set = this.openIssuesClients.get(author);
    }
    set.add(issue.id);

    if (issue.applications?.length > 0) {
      for (const app of issue.applications) {
        this.broker.emit(NEW_ISSUE_APPLICATION, {
          issue,
          application: app,
        });
      }
    }

    const preparedTechs = await this.getPreparedTechs(issue);
    const closests = await this.getClosests2Issue(issue, preparedTechs);

    for (const tech of closests) {
      this.registerTech2OpennedIssue(issue.id, tech);
    }
  }

  async newApplication(app: IssueApplication) {
    const a = 7;
  }

  async issueCancelled(id) {
    const i = this.openIssues.get(id);

    if (i) {
      i.techs.forEach(({ id }) => {
        const conn = this.clients.get(id);

        if (!conn) return;

        conn.ws.emit(ISSUE_UNAVAILABLE, {
          issue: i.issue,
          reason: 'Incidencia cancelada por usuario',
        });
      });

      this.openIssues.delete(id);
    }

    const { tech, applications, ...issue } = await this.issuesRepo
      .createQueryBuilder('i')
      .leftJoin('i.tech', 'tech')
      .leftJoin('i.applications', 'apps', `apps.state='pendent'`, {
        pendent: ISSUE_APPLICATION_STATE.PENDENT,
      })
      .leftJoin('apps.tech', 'apptech')
      .addSelect(['tech.username', 'apps.id', 'apptech.username'])
      .innerJoinAndSelect('i.type', 'type')
      .innerJoinAndSelect('i.client_location', 'client_location')
      .innerJoinAndSelect('client_location.province', 'province')
      .innerJoinAndSelect(
        'client_location.municipality',
        'prmunicipalityovince',
      )
      .innerJoin('i.user', 'u')
      .addSelect(['u.username', 'u.name', 'u.lastname', 'u.phone_number'])
      .where('i.id=:id', { id })
      .getOne();

    if (tech) {
      const techConn = this.clients.get(tech.username);
      if (techConn) {
        techConn.ws.emit(ISSUE_CANCELLED, {
          issue,
          reason: 'Incidencia cancelada por usuario',
        });
      }
    } else {
      for (const {
        tech: { username },
      } of applications) {
        for (const [
          id,
          {
            ws,
            user: {
              user: { username: us },
            },
          },
        ] of this.clients) {
          if (us == username) {
            ws.emit(ISSUE_CANCELLED, {
              issue,
              reason: 'Incidencia cancelada por usuario',
            });
            break;
          }
        }
      }
    }
    const a = 7;
  }

  async techRejected(app: IssueApplication) {
    for (const [
      id,
      {
        user: {
          user: { username },
        },
        ws,
      },
    ] of this.clients) {
      if (username != app.tech.username) continue;
      ws.emit(TECH_REJECTED, app);
    }
  }

  findTechClient(
    tech: string,
  ):
    | { id: string; client: WsTech; available?: TECH_STATUS_UPDATE; ws: Socket }
    | false {
    const client = this.findTech(tech);

    if (!client) return false;

    const con = this.clients.get(client);
    const available = this.availableTechs.get(client);

    return con
      ? {
          id: client,
          client: con,
          available,
          ws: con.ws,
        }
      : false;
  }

  async techAccepted({
    tech,
    issue,
    application,
    refused = [],
  }: {
    issue: IssuesEntity;
    tech: TechniccianEntity;
    application: IssueApplication;
    refused: string[];
  }) {
    for (const rtech of refused) {
      const client = this.findTech(rtech);

      if (!client) return false;

      const con = this.clients.get(client);

      if (!con) return;

      con.ws.emit(ISSUE_UNAVAILABLE, {
        issue,
        reason: 'Incidencia asignada a otro tecnico',
      });
    }

    const techClient = this.findTechClient(tech.user.username);

    if (!techClient) return;

    const { available, client, id } = techClient;

    if (!available) {
      // return;
    }

    if (client.progress?.issue?.id == issue.id) {
      delete client.progress;
    }

    const info = await this.getPendentIssueInfo(
      id,
      client.user,
      available,
      issue,
      application,
    );

    client.ws.emit(TECH_ACCEPTED, info);

    client.pendents.set(issue.id, info);

    this.openIssues.delete(issue.id);
  }

  async getPendentIssueInfo(
    id: string,
    tech: TechniccianEntity,
    status: TECH_STATUS_UPDATE,
    issue: IssuesEntity,
    application: IssueApplication,
  ): Promise<PENDENT_ISSUE> {
    const inProgress = issue.state == ISSUE_STATE.PROGRESS;
    const distance = inProgress
      ? null
      : await this.distanceInfo(id, tech, status, issue);

    let arrive_date =
      !inProgress && distance?.route
        ? moment().add(distance.duration, 'seconds').toDate()
        : undefined;

    if (!inProgress) {
      Logger.log(
        `Ruta calculada para el tecnico: ${tech.user.username}
      en la incidencia: ${issue.id}(${issue.description})`,
        'RouteCalculator',
      );
    }
    return {
      refresh_date: new Date(),
      arrive_date,
      distance,
      status,
      issue,
      tech,
      application,
    };
  }

  async issueOnTheWay({ issue, tech }: { tech: string; issue: IssuesEntity }) {
    const techClient = this.findTechClient(tech);
    if (!techClient) {
      throw new Error(
        `Tecnico: ${tech} con tarea en progreso: ${issue.id} sin cliente en el socket`,
      );
    }

    const { available, id, client, ws } = techClient;

    if (!available) {
      throw new Error(
        `Tecnico: ${tech} con tarea en progreso: ${issue.id} sin actualizacion del estado en el socket`,
      );
    }

    let pendent: PENDENT_ISSUE = client.pendents.get(issue.id);

    if (!pendent) {
      const application = await this.issuesAppRepo
        .createQueryBuilder('ia')
        .innerJoinAndSelect('ia.issue', 'i')
        .leftJoinAndSelect('i.client_location', 'client_location')
        .innerJoinAndSelect('client_location.province', 'province')
        .innerJoinAndSelect(
          'client_location.municipality',
          'prmunicipalityovince',
        )
        .innerJoin('i.user', 'u')
        .innerJoin('ia.tech', 'tu')
        .addSelect(['tu.username', 'tu.id'])
        .addSelect(['u.username', 'u.name', 'u.lastname', 'u.phone_number'])
        .where('i.id=:issue and tu.username=:tech', {
          issue: issue.id,
          tech,
        })
        .leftJoinAndSelect('i.traces', 'itraces')
        .getOne();

      pendent = await this.getPendentIssueInfo(
        id,
        client.user,
        available,
        issue,
        application,
      );
    } else {
      pendent.issue = issue;
    }

    if (pendent) {
      client.pendents.delete(issue.id);
    }

    client.progress = pendent;

    this.broker.emit(CLIENT_ISSUE_IN_PROGRESS_UPDATE, pendent);

    ws.emit(TECH_ISSUE_IN_PROGRESS_UPDATE, pendent);
  }

  shouldRoute(
    { gps: { x: nx, y: ny }, profile: np }: TECH_STATUS_UPDATE,
    { gps: { x: ox, y: oy }, profile: op }: TECH_STATUS_UPDATE,
  ) {
    if (np != op) return true;
    if (!nx) return;
    if (nx == ox && ny == oy) return false;

    const d = distance(point([nx, ny]).geometry, point([ox, oy]).geometry, {
      units: 'meters',
    });

    const limit: number = +(
      process.env?.ROUTE_MAX_DISTANCE ?? DEFAULT_MIN_ROUTE_DISTANCE
    );

    return d > limit;
  }

  async refreshProgressIssueInfo(id: string, old?: TECH_STATUS_UPDATE) {
    const client = this.clients.get(id);
    const current = this.availableTechs.get(id);

    if (!client || !current) {
      Logger.warn(
        `No se encontro informacion del socket/estado del id:${id} `,
        'IssueProgressRefresh',
      );
      return;
    }

    if (
      !client.progress ||
      client?.progress?.issue?.state == ISSUE_STATE.PROGRESS
    )
      return;

    if (!!old) {
      const should = this.shouldRoute(current, old);

      if (!should) return;
    }

    const updated = await this.getPendentIssueInfo(
      id,
      client.user,
      current,
      client.progress.issue,
      client.progress.application,
    );

    client.progress = updated;
    this.broker.emit(CLIENT_ISSUE_IN_PROGRESS_UPDATE, updated);

    client.ws.emit(TECH_ISSUE_IN_PROGRESS_UPDATE, updated);

    const a = 7;
  }

  async refreshIssueInfo(issue: IssuesEntity, tech: string) {
    const client = this.findTechClient(tech);
    if (!client) return;
    if (issue.state == ISSUE_STATE.TRAVELING) {
      this.refreshProgressIssueInfo(client.id);
    } else {
      const pendent = client.client.pendents.get(issue.id);
      if (!pendent) return;
      const updated = await this.getPendentIssueInfo(
        client.id,
        client.client.user,
        client.available,
        pendent.issue,
        pendent.application,
      );

      client.ws.emit(TECH_ACCEPTED, updated);

      client.client.pendents.set(issue.id, updated);
    }
  }

  async issueInProgress(issue: IssuesEntity) {
    const client = this.findTechClient(issue.tech.username);
    if (!client) return;
    if (!client.client.progress) {
      const application = await this.issuesAppRepo
        .createQueryBuilder('ia')
        .innerJoinAndSelect('ia.issue', 'i')
        .leftJoinAndSelect('i.client_location', 'client_location')
        .innerJoinAndSelect('client_location.province', 'province')
        .innerJoinAndSelect(
          'client_location.municipality',
          'prmunicipalityovince',
        )
        .innerJoin('i.user', 'u')
        .innerJoin('ia.tech', 'tu')
        .addSelect(['tu.username', 'tu.id'])
        .addSelect(['u.username'])
        .where('i.id=:issue and tu.username=:tech', {
          issue: issue.id,
          tech: client.client.user.user.username,
        })
        .getOne();

      client.client.progress = await this.getPendentIssueInfo(
        client.id,
        client.client.user,
        client.available,
        issue,
        application,
      );
    }
    client.client.progress.issue = issue;
    client.ws.emit(ISSUE_IN_PROGRESS, client.client.progress);
  }

  issueFinished(issue: IssuesEntity) {
    const client = this.findTechClient(issue.tech.username);
    if (!client) return;
    if (!client.client.progress) return;
    client.client.progress.issue = issue;
    delete client.client.progress;
    client.ws.emit(ISSUE_FINISHED, issue);

    this.search4PendentEvaluations(client.ws, issue.tech.username, issue.id);
  }

  techRated(rating: RatingsEntity) {
    const client = this.findTechClient(rating.to.username);
    if (!client) return;
    client.ws.emit(TECH_RATED, rating);
  }

  async getIssuesStates() {
    const openissues = {};

    for (const [id, v] of this.openIssues) {
      openissues[id] = v;
    }

    const techs = {};
    for (const [id, { user, pendents }] of this.clients) {
      const p = {};
      for (const [id, pendent] of pendents) {
        p[id] = pendent;
      }
      techs[user.user.username] = {
        pendents: p,
      };
    }

    return {
      openissues,
      techs,
    };
  }
}
