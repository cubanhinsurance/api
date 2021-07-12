import { Injectable, InjectableOptions } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { CoinsEntity } from 'src/modules/enums/entities/coins.entity';
import { getMetadataArgsStorage } from 'typeorm';
import { getEntitySchema } from '../swagger.helper';
import { TYPEORM_SERVICE_OPTIONS } from '../typeorm.interfaces';
import { TypeOrmService } from '../typeorm.service';

export const TYPEORM_ENTITY_SERVICE_META = 'TYPEORM_ENTITY_SERVICE_META';

export const TypeOrmEntityService = <
  Service extends TypeOrmService = any,
  Entity = any
>(
  options: TYPEORM_SERVICE_OPTIONS<Service, Entity>,
  injectOptions?: InjectableOptions,
) => {
  const injectFn = Injectable(injectOptions);

  options.model.schema =
    options.model.schema ?? getEntitySchema(options.model);

  const metadatas = getMetadataArgsStorage();
  const classMeta = metadatas.filterColumns(CoinsEntity);

  return function (target) {
    injectFn(target);
    Reflect.defineMetadata(TYPEORM_ENTITY_SERVICE_META, options, target);
  };
};
