import { Inject, Injectable } from '@nestjs/common';
import { IssuesEntity } from 'src/modules/bussines/entities/issues.entity';
import { IssuesService } from 'src/modules/bussines/services/issues.service';
import { IoMessage, WsClient } from './clients_io.service';
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

export interface OPEN_ISSUES {
  issue: IssuesEntity;
  techs: AVAILABLE_FOR_ISSUE_INFO[];
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

@Injectable()
export class IssuesCacheService {
  clients: Map<string, WsClient>;
  availableTechs: Map<string, TECH_STATUS_UPDATE>;
  private openIssues: Map<number, OPEN_ISSUES>;
  constructor(
    @Inject('BROKER') private broker: ClientProxy,
    private usersService: UsersService,
    private gisService: GisService,
    private osrmService: OsrmService,
    @InjectEntityManager() private manager,
  ) {
    this.openIssues = new Map<number, OPEN_ISSUES>();
    this.clients = new Map<string, WsClient>();
    this.availableTechs = new Map<string, TECH_STATUS_UPDATE>();
  }

  async techConnected(username: string, client: Socket) {
    const user = await this.usersService.getTechnichianInfo(username);

    this.clients.set(client.id, {
      user,
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
    //todo emitir evento unavailable
  }

  techAvailable(id: string, status: TECH_STATUS_UPDATE) {
    this.updateTechStatus(id, status);
    //todo emitir evento unavailable
  }

  getTechUser(id: string) {
    return this.clients.get(id)?.user;
  }

  updateTechStatus(id: string, status: TECH_STATUS_UPDATE) {
    let tech = this.availableTechs.get(id);
    if (!tech && !status.available) return;
    this.availableTechs.set(id, status);
  }

  private async cacheOpenedIssue(i: IssuesEntity): Promise<OPEN_ISSUES> {
    this.openIssues.set(i.id, {
      issue: i,
      techs: [],
    });

    return this.openIssues.get(i.id);
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
      const { user, ws } = this.clients.get(id);
      if (this.isPrepared(user, issue.type))
        res.push({
          id,
          data,
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
  ) {
    return {
      id,
      tech,
      status,
      linearDistance: this.getLinearDistance(tech, status, issue),
      route: await this.getRoute(tech, status, issue),
    };
  }

  async getClosests2Issue(issue: IssuesEntity, preparedTechs: any[]) {
    const distances = await Promise.all(
      preparedTechs.map(({ id, data, user }) => {
        return this.distanceInfo(id, user, data, issue);
      }),
    );

    const { max_distance, max_techs } = issue;

    //todo me quede aqui
    const g = 8;
  }

  async issueCreated(issue: IssuesEntity) {
    const max = 200;

    let res = [];
    const preparedTechs = this.getPreparedTechs(issue);
    const closests = await this.getClosests2Issue(issue, preparedTechs);

    for (const [id, data] of this.availableTechs) {
      if (!this.clients.has(id)) continue;
      const { user, ws } = this.clients.get(id);

      const availableInfo = await this.getAvailableInfo(user, issue, data);

      const b = 7;
    }

    const a = 7;
  }
}
