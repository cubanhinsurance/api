import {
  assignMetadata,
  createParamDecorator,
  NotImplementedException,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TYPEORM_ENTITY_SERVICE_META } from './typeorm.decorators';
import {
  DefaultInterceptor,
  TYPEORM_CRUD_OPTIONS,
  TYPEORM_SERVICE_OPTIONS,
} from './typeorm.interfaces';
import { TypeOrmService } from './typeorm.service';
import { singular as singularize, plural as pluralize } from 'pluralize';
import j2s from 'joi-to-swagger';
import { array } from 'joi';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

const routeHandlerMethod = (path?: string): MethodDecorator => null;

export interface SWAGGER_OPTIONS {
  summary?: string;
}

export const ID_PARAM = ':__id__';

export const prepareRoute = <Service>(
  {
    service,
    handler: customHandler,
    swagger: { summary } = {},
    plural = false,
    void: isVoid = false,
    params,
    interceptor = DefaultInterceptor,
  }: TYPEORM_CRUD_OPTIONS<Service>,
  routeHandler: typeof routeHandlerMethod,
  handler: Function,
  path: string,
): MethodDecorator => {
  const meta: TYPEORM_SERVICE_OPTIONS = Reflect.getMetadata(
    TYPEORM_ENTITY_SERVICE_META,
    service,
  );
  if (!meta) {
    throw new Error(
      `Missing "TypeOrmEntityService" metadata for class: ${service.name}`,
    );
  }

  const id = meta.model.id ?? service.name;
  const resolver = routeHandler(path.replace(ID_PARAM, id));

  const sw_operation = summary
    ? ApiOperation({
        summary: summary.replace(
          ':name',
          (plural ? pluralize : singularize)(meta.model.name),
        ),
      })
    : null;

  const sw_okresponse =
    isVoid && !meta.model.schema
      ? null
      : ApiOkResponse({
          schema: j2s(
            plural ? array().items(meta.model.schema) : meta.model.schema,
          ).swagger,
        });

  return (target: any, property: string, descriptor: PropertyDescriptor) => {
    const old = descriptor.value;

    descriptor.value = async function () {
      if (!(this as object).hasOwnProperty(id))
        throw new NotImplementedException();

      return customHandler
        ? await this[id][customHandler](...arguments)
        : await handler.call(this[id], ...arguments);
    };
    resolver(target, property, descriptor);

    if (params?.length > 0) {
      const metadata = Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        target.constructor,
        property,
      );
      let index = Object.keys(metadata).length;
      for (const paramDec of params) {
        paramDec(target, property, index);
        index++;
      }
    }

    if (sw_operation) sw_operation(target, property, descriptor);
    if (sw_okresponse) sw_okresponse(target, property, descriptor);
  };
};

export const mergeSwagger = (
  merge: SWAGGER_OPTIONS,
  swagger?: SWAGGER_OPTIONS,
) => ({ ...merge, ...(swagger ?? {}) });
