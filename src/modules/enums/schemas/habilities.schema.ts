import { array, number, object, string } from 'joi';

export const CREATE_HABILITIES_REQUIREMENTS_SCHEMA = object({
  name: string().required(),
});

export const HABILITIES_REQUIREMENTS_SCHEMA = CREATE_HABILITIES_REQUIREMENTS_SCHEMA.keys(
  {
    id: number(),
  },
);

export const CREATE_HABILITIES_SCHEMA = object({
  name: string().required(),
  description: string().optional(),
  requirements: array().items(CREATE_HABILITIES_REQUIREMENTS_SCHEMA).optional(),
});

export const CREATE_GROUP_SCHEMA = object({
  name: string().required(),
});

export const GROUP_SCHEMA = CREATE_GROUP_SCHEMA.keys({
  id: number(),
});

export const HABILITIES_SCHEMA = CREATE_HABILITIES_SCHEMA.keys({
  id: number(),
  group: GROUP_SCHEMA,
  requirements: array().items(HABILITIES_REQUIREMENTS_SCHEMA),
});

export const GROUP_QUERY_SCHEMA = GROUP_SCHEMA.keys({
  habilities: array().items(HABILITIES_SCHEMA),
});

export const GROUPS_QUERY_SCHEMA = array().items(GROUP_QUERY_SCHEMA);
