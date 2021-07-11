import { Get, Param } from '@nestjs/common';
import { TYPEORM_CRUD_OPTIONS } from '../typeorm.interfaces';
import { TypeOrmService } from '../typeorm.service';
import { ID_PARAM, mergeSwagger, prepareRoute } from '../typeorm.utils';

export const GetOne = <Service extends TypeOrmService>(
  options: TYPEORM_CRUD_OPTIONS<Service>,
  path?: string,
) => {
  options.swagger = mergeSwagger(
    {
      summary: `Devuelve el(la) :name`,
    },
    options.swagger,
  );

  return prepareRoute(
    {
      ...options,
      ...{
        plural: false,
      },
      params: [Param('id')],
    },
    Get,
    async function (id: any) {
      return (this as Service).findOne(id, options.interceptor);
    },
    path ?? `${ID_PARAM}/:id`,
  );
};
