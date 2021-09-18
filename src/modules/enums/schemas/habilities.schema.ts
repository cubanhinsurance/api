import * as joi from 'joi';

export const CREATE_HABILITIES_REQUIREMENTS_SCHEMA = joi.object({
  name: joi.string().required(),
});

export const HABILITIES_REQUIREMENTS_SCHEMA =
  CREATE_HABILITIES_REQUIREMENTS_SCHEMA.keys({
    id: joi.number(),
  });

export const CREATE_HABILITIES_SCHEMA = joi.object({
  name: joi.string().required(),
  description: joi.string().optional(),
  requirements: joi
    .array()
    .items(CREATE_HABILITIES_REQUIREMENTS_SCHEMA)
    .optional(),
});

export const CREATE_GROUP_SCHEMA = joi.object({
  name: joi.string().required(),
});

export const GROUP_SCHEMA = CREATE_GROUP_SCHEMA.keys({
  id: joi.number(),
});

export const HABILITIES_SCHEMA = CREATE_HABILITIES_SCHEMA.keys({
  id: joi.number(),
  group: GROUP_SCHEMA,
  requirements: joi.array().items(HABILITIES_REQUIREMENTS_SCHEMA),
});

export const GROUP_QUERY_SCHEMA = GROUP_SCHEMA.keys({
  habilities: joi.array().items(HABILITIES_SCHEMA),
});

export const GROUPS_QUERY_SCHEMA = joi.array().items(GROUP_QUERY_SCHEMA);
