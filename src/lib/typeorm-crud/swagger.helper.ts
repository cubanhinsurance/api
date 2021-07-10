import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { any, boolean, number, object, string } from 'joi';
import { getMetadataArgsStorage } from 'typeorm';

export const getEntitySchema = (entity) => {
  const metadata = getMetadataArgsStorage();
  const entityMeta = metadata.filterColumns(entity);

  let schema = {};
  for (const {
    propertyName,
    options: { type, nullable, select, default: defaultValue, ...options },
  } of entityMeta) {
    if (select === false) continue;
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
    schema[propertyName] = propSchema;
  }

  return object(schema);
};
