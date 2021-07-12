import { Body, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { object } from 'joi';
import { JoiPipe } from 'src/lib/pipes/joi.pipe';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs';
import { TYPEORM_CRUD_OPERATIONS } from '../operations';
import {
  entityColumn2JoiSchema,
  getBodySchema,
  getSchemaFromEntity,
} from '../swagger.helper';
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
      operation: TYPEORM_CRUD_OPERATIONS.CREATE_ONE,
      withBody: true,
    },
    Post,
    async function () {
      return (this as Service).find();
    },
    path ?? ID_PARAM,
  );
};
