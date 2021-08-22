import { Inject, Injectable, Logger } from '@nestjs/common';
import { IssuesEntity } from 'src/modules/bussines/entities/issues.entity';
import { TechniccianEntity } from 'src/modules/users/entities/techniccian.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { Socket } from 'socket.io';
import { ClientProxy } from '@nestjs/microservices';
import { IssuesTypesEntity } from 'src/modules/enums/entities/issues_types.entity';
import { HabilitiesEntity } from 'src/modules/enums/entities/habilities.entity';
import { GisService } from 'src/modules/gis/services/gis.service';
import { distance, point } from '@turf/turf';
import { OsrmService, Point, PROFILE } from 'src/modules/osrm/src/osrm.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IssueApplication } from 'src/modules/bussines/entities/issues_applications.entity';
import {
  ISSUE_CREATED,
  ISSUE_UNAVAILABLE,
  NEW_ISSUE_APPLICATION,
} from 'src/modules/bussines/io.constants';

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

export interface WsTech {
  ws: Socket;
  reviews: any;
  user: TechniccianEntity;
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

@Injectable()
export class IssuesCacheService {
  clients: Map<string, WsTech>;
  availableTechs: Map<string, TECH_STATUS_UPDATE>;
  openIssues: Map<number, OPEN_ISSUES>;
  constructor(
    @Inject('BROKER') private broker: ClientProxy,
    private usersService: UsersService,
    private gisService: GisService,
    private osrmService: OsrmService,
    @InjectEntityManager() private manager,
  ) {
    this.openIssues = new Map<number, OPEN_ISSUES>();
    this.clients = new Map<string, WsTech>();
    this.availableTechs = new Map<string, TECH_STATUS_UPDATE>();
  }

  async techConnected(username: string, client: Socket) {
    const user = await this.usersService.getTechnichianInfo(username);
    const reviews = await this.usersService.getTechniccianReview(username);

    this.clients.set(client.id, {
      user,
      reviews,
      ws: client,
    });
  }

  techDisconnected(client: Socket) {
    this.techUnavailable(client);
    this.clients.delete(client.id);
    //todo emitir evento desconectado
  }

  techUnavailable(client: Socket) {
    this.availableTechs.delete(client.id);

    const { user, ws } = this.clients.get(client.id);
    this.unRegisterTechFromOppendIssues(user.user.username);
  }

  async techAvailable(id: string, status: TECH_STATUS_UPDATE) {
    const first = !this.availableTechs.get(id);
    this.updateTechStatus(id, status);

    const { user, ws, reviews } = this.clients.get(id);

    if (first) {
      for (const [issueId, { issue, techs, applications }] of this.openIssues) {
        if (!!techs.get(user.user.username)) continue;
        if (!!applications.get(user.user.username)) continue;
        if (!this.isPrepared(user, issue.type)) continue;
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
  }

  getTechUser(id: string) {
    return this.clients.get(id)?.user;
  }

  updateTechStatus(id: string, status: TECH_STATUS_UPDATE) {
    let tech = this.availableTechs.get(id);
    if (!tech && !status.available) return;
    this.availableTechs.set(id, status);
  }

  async getIssue(id: number) {
    const cached = this.openIssues.get(id);
    if (!!cached) return cached;
  }

  isPrepared(tech: TechniccianEntity, { rules }: IssuesTypesEntity): boolean {
    if (!rules || rules?.length == 0 || rules?.[0]?.length == 0) return true;

    const [ors] = rules;

    return !!tech.habilities.find(
      (h: HabilitiesEntity) => !!ors.find((id) => id == h.id),
    );
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
    const hasLocation = false && !!gx;
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
    if (!this.isPrepared(tech, issue.type)) return false;
    const travelInfo = await this.isCloseEnough(tech, issue, status);
    if (!travelInfo) return false;
    return {
      technichian: tech,
      travel: await this.isCloseEnough(tech, issue, status),
    };
  }

  getPreparedTechs(issue: IssuesEntity) {
    const res = [];
    for (const [id, data] of this.availableTechs) {
      if (!this.clients.has(id)) continue;
      const { user, ws, reviews } = this.clients.get(id);
      if (this.isPrepared(user, issue.type))
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
    const distances = ((await Promise.all(
      preparedTechs.map(({ id, data, user }) => {
        return this.distanceInfo(id, user, data, issue);
      }),
    )) as any[]).filter((v) => !!v);

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

    if (issue.applications?.length > 0) {
      for (const app of issue.applications) {
        this.broker.emit(NEW_ISSUE_APPLICATION, app);
      }
    }

    const preparedTechs = this.getPreparedTechs(issue);
    const closests = await this.getClosests2Issue(issue, preparedTechs);

    for (const tech of closests) {
      this.registerTech2OpennedIssue(issue.id, tech);
    }
  }

  async newApplication(app: IssueApplication) {
    const a = 7;
  }
}
