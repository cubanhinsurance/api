import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { AnySchema, ObjectSchema } from 'joi';
import { SelectQueryBuilder } from 'typeorm';
import { TypeOrmService } from './typeorm.service';
import { SWAGGER_OPTIONS } from './typeorm.utils';

export interface TYPEORM_SERVICE_OPTIONS {
  model: {
    type: EntityClassOrSchema;
    id?: string;
    comment?: string;
    name: string;
    schema?: AnySchema;
  };
  operations?: {};
}

const interceptor = (qr: SelectQueryBuilder<any>, ...args): void => null;

export type QueryInterceptor = typeof interceptor;

export const DefaultInterceptor = (qt) => qt;

const response = (...any): MethodDecorator => null;

const bodyFactory = (definition: TYPEORM_SERVICE_OPTIONS): ObjectSchema => null;

export interface TYPEORM_CRUD_OPTIONS<Service> {
  service: any;
  name?: string;
  handler?: keyof Service;
  swagger?: SWAGGER_OPTIONS;
  plural?: boolean;
  void?: boolean;
  params?: ParameterDecorator[];
  interceptor?: QueryInterceptor;
  responses?: MethodDecorator[];
  response?: typeof response;
  body?: typeof bodyFactory;
  bodySchema?: ObjectSchema;
}
