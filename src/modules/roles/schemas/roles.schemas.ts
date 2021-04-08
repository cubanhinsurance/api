import { array, boolean, number, object, string } from 'joi';
import { FunctionalitiesList } from 'src/modules/functionalities/schemas/functionalities.schemas';

export const ROLE_SCHEMA = object({
  id: number().required(),
  name: string().required(),
  root: boolean().description('Define si es un rol administrativo'),
  description: string().optional(),
  functionalities: FunctionalitiesList.optional(),
});

export const UPDATE_ROLE_SCHEMA = object({
  name: string().optional(),
  description: string().optional(),
  functionalities: array().items(string()).optional(),
});

export const ROLES_LIST_SCHEMA = array().items(ROLE_SCHEMA);

export const CREATE_ROLE_SCHEMA = object({
  name: string().required(),
  description: string().optional(),
  functionalities: array().items(string()).optional(),
});
