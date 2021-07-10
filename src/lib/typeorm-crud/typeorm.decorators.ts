import {
  Get,
  Inject,
  Injectable,
  InjectableOptions,
  Logger,
  NotImplementedException,
  Query,
  Req,
} from '@nestjs/common';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { getMetadataStorage } from 'class-validator';
import { CoinsEntity } from 'src/modules/enums/entities/coins.entity';
import {
  EntityMetadata,
  getConnection,
  getConnectionManager,
  getMetadataArgsStorage,
  getRepository,
} from 'typeorm';
import { getEntitySchema } from './swagger.helper';
import {
  TYPEORM_CRUD_OPTIONS,
  TYPEORM_SERVICE_OPTIONS,
} from './typeorm.interfaces';
import { TypeOrmService } from './typeorm.service';
import {
  ID_PARAM,
  mergeSwagger,
  prepareRoute,
  SWAGGER_OPTIONS,
} from './typeorm.utils';

export const TYPEORM_ENTITY_SERVICE_META = 'TYPEORM_ENTITY_SERVICE_META';

export const TypeOrmEntityService = (
  options: TYPEORM_SERVICE_OPTIONS,
  injectOptions?: InjectableOptions,
) => {
  const injectFn = Injectable(injectOptions);

  options.model.schema =
    options.model.schema ?? getEntitySchema(options.model.type);

  const metadatas = getMetadataArgsStorage();
  const classMeta = metadatas.filterColumns(CoinsEntity);

  return function (target) {
    injectFn(target);
    Reflect.defineMetadata(TYPEORM_ENTITY_SERVICE_META, options, target);
  };
};

export const GetAll = <Service extends TypeOrmService>(
  options: TYPEORM_CRUD_OPTIONS<Service>,
  path?: string,
) => {
  options.swagger = mergeSwagger(
    {
      summary: `Develve listado de :name`,
    },
    options.swagger,
  );

  return prepareRoute(
    {
      ...options,
      ...{
        plural: true,
      },
      params: [Req(), Query('asd')],
    },
    Get,
    async function () {
      return (this as Service).find();
    },
    path ?? ID_PARAM,
  );
};
