import { HttpException, HttpService, Inject, Injectable } from '@nestjs/common';
import { OsrmModuleOptions } from './osrm.module';

export enum GEOMETRY_TYPE {
  POLYLINE = 'polyline',
  POLYLINE6 = 'polyline',
  GEOJSON = 'geojson',
}

export enum CONTINUE_STRAIGHT {
  DEFAULT = 'default',
  TRUE = 'true',
  FALSE = 'false',
}

export enum OVERVIEW {
  SIMPLIFIED = 'simplified',
  TRUE = 'true',
  FALSE = 'false',
}

export type Point = {
  type: 'Point';
  coordinates: [x: number, y: number];
};

interface ROUTE {
  distance: number;
  duration: number;
  geometry: any;
  weight: number;
  legs: any[];
  weight_name: string;
}

export interface ROUTE_RESPONSE {
  code: any;
  waypoints: any;
  routes: ROUTE[];
}

export interface ROUTE_OPTIONS {
  alternatives?: boolean;
  steps?: boolean;
  annotations?: boolean;
  continue_straight?: CONTINUE_STRAIGHT;
  overview?: OVERVIEW;
  geometries?: GEOMETRY_TYPE;
}

export enum PROFILE {
  BIKE = 'bike',
  CAR = 'car',
  FOOT = 'foot',
}

@Injectable()
export class OsrmService {
  constructor(
    @Inject('OSRM_OPTIONS') private options: OsrmModuleOptions,
    private http: HttpService,
  ) {}

  async route(
    { coordinates: [x1, y1] }: Point,
    { coordinates: [x2, y2] }: Point,
    profile: PROFILE = PROFILE.CAR,
    {
      alternatives = false,
      steps = false,
      annotations = false,
      continue_straight = CONTINUE_STRAIGHT.DEFAULT,
      overview = OVERVIEW.SIMPLIFIED,
      geometries = GEOMETRY_TYPE.GEOJSON,
    }: ROUTE_OPTIONS = {},
  ): Promise<ROUTE_RESPONSE> {
    const { api, bike_api, car_api, foot_api } = this.options;
    const baseProfile =
      profile == PROFILE.CAR
        ? car_api ?? api
        : profile == PROFILE.BIKE
        ? bike_api ?? api
        : foot_api ?? api;
    const url = `${baseProfile}/route/v1/${profile}/${x1},${y1};${x2},${y2}?alternatives=${alternatives}&steps=${steps}&annotations=${annotations}&geometries=${geometries}&overview=${overview}&continue_straight=${continue_straight}`;
    try {
      const { data, status, statusText } = await this.http.get(url).toPromise();

      if (status != 200) throw new HttpException(statusText ?? data, status);
      if (data.code != 'Ok') throw new HttpException(statusText, 500);
      return data;
      const b = 7;
    } catch (e) {
      const n = 6;
    }
    return null;
  }

  async nearest() {}

  async table() {}

  async match() {}

  async trip() {}

  async tile() {}
}
