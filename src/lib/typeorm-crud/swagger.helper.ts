import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import {
  any,
  AnySchema,
  boolean,
  number,
  object,
  ObjectSchema,
  string,
} from 'joi';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { EntityMetadata, getMetadataArgsStorage } from 'typeorm';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';

export const getEntitySchema = (entity): ObjectSchema => {
  return getSchemaFromEntity(entity, entity2Joi);
};

export const entity2Joi = ({
  propertyName,
  options: { type, nullable, select, default: defaultValue, ...options },
}: ColumnMetadataArgs) => {
  if (select === false) return;

  let propSchema =
    type == Number
      ? number()
      : type == String
      ? string()
      : type == Boolean
      ? boolean()
      : any();

  propSchema = propSchema[nullable ? 'optional' : 'required']();
  if (typeof defaultValue != 'undefined')
    propSchema = propSchema.default(defaultValue);

  return propSchema;
};

const columParser = (col: ColumnMetadataArgs): AnySchema | void => {};

export const getSchemaFromEntity = (
  entity,
  parser: typeof columParser,
): ObjectSchema => {
  const metadata = getMetadataArgsStorage();
  const entityMeta = metadata.filterColumns(entity);

  let schema = {};
  for (const colMeta of entityMeta) {
    const generated = metadata.findGenerated(colMeta.target, colMeta.propertyName);
    const sch = parser(colMeta);
    if (!sch) continue;
    schema[colMeta.propertyName] = sch;
  }

  return object(schema);
};
