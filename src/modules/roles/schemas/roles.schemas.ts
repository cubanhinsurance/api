import * as joi from 'joi';
import { FunctionalitiesList } from 'src/modules/functionalities/schemas/functionalities.schemas';

export const ROLE_SCHEMA = joi.object({
  id: joi.number().required(),
  name: joi.string().required(),
  root: joi.boolean().description('Define si es un rol administrativo'),
  description: joi.string().optional(),
  functionalities: FunctionalitiesList.optional(),
});

export const UPDATE_ROLE_SCHEMA = joi.object({
  name: joi.string().optional(),
  description: joi.string().optional(),
  root: joi
    .boolean()
    .optional()
    .description('Define si es un rol administrativo'),
  functionalities: joi.array().items(joi.string()).optional(),
});

export const ROLES_LIST_SCHEMA = joi.array().items(ROLE_SCHEMA);

export const CREATE_ROLE_SCHEMA = joi.object({
  name: joi.string().required(),
  description: joi.string().optional(),
  root: joi
    .boolean()
    .optional()
    .description('Define si es un rol administrativo'),
  functionalities: joi.array().items(joi.string()).optional(),
});
