import { array, boolean, number, object, string } from 'joi';
import { FunctionalitiesList } from 'src/modules/functionalities/schemas/functionalities.schemas';

export const ROLE_SCHEMA = object({
  id: number().required(),
  name: string().required(),
  root: boolean().description('Define si es un rol administrativo'),
  description: string().optional(),
  functionalities: FunctionalitiesList.optional(),
});

export const ROLES_LIST_SCHEMA = array().items(ROLE_SCHEMA);
