import { Body, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { object } from 'joi';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';
import { getSchemaFromEntity } from '../swagger.helper';
import {
  TYPEORM_CRUD_OPTIONS,
  TYPEORM_SERVICE_OPTIONS,
} from '../typeorm.interfaces';
import { TypeOrmService } from '../typeorm.service';
import { ID_PARAM, mergeSwagger, prepareRoute } from '../typeorm.utils';

export const CreateOne = <Service extends TypeOrmService>(
  options: TYPEORM_CRUD_OPTIONS<Service>,
  path?: string,
) => {
  options.swagger = mergeSwagger(
    {
      summary: `Crea un(a) :name`,
    },
    options.swagger,
  );

  const schema = object({});

  return prepareRoute(
    {
      ...options,
      ...{
        plural: false,
      },
      void: options.void ?? true,
      responses: [ApiConflictResponse()],
      response: ApiCreatedResponse,
      body: (def: TYPEORM_SERVICE_OPTIONS) => {
        return getSchemaFromEntity(
          def.model.type,
          (def: ColumnMetadataArgs) => {
            // if(def.options.primary)
          },
        );
      },
    },
    Post,
    async function () {
      return (this as Service).find();
    },
    path ?? ID_PARAM,
  );
};
