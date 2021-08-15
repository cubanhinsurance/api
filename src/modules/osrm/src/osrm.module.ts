import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { OsrmService } from './osrm.service';

export interface OsrmModuleOptions {
  api?: string;
  car_api?: string;
  bike_api?: string;
  foot_api?: string;
}

export interface SyncOsrmModuleOptions extends OsrmModuleOptions {
  global?: boolean;
  timeout?: number;
}

const factory = (...any): OsrmModuleOptions => null;

export interface AsyncOsrmModuleOptions {
  global?: boolean;
  timeout?: number;
  inject?: any[];
  useFactory: typeof factory;
}

@Module({})
export class OsrmModule {
  static forRoot({
    global = true,
    timeout,
    ...config
  }: SyncOsrmModuleOptions): DynamicModule {
    return {
      global,
      module: OsrmModule,
      imports: [
        HttpModule.register({
          timeout,
        }),
      ],
      providers: [
        OsrmService,
        {
          provide: 'OSRM_OPTIONS',
          useValue: config,
        },
      ],
      exports: [OsrmService],
    };
  }

  static forRootAsnc({
    global = true,
    timeout,
    useFactory,
    inject,
  }: AsyncOsrmModuleOptions): DynamicModule {
    return {
      global,
      module: OsrmModule,
      imports: [
        HttpModule.register({
          timeout,
        }),
      ],
      providers: [
        OsrmService,
        {
          provide: 'OSRM_OPTIONS',
          inject,
          useFactory,
        },
      ],
      exports: [OsrmService],
    };
  }
}
