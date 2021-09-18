import * as joi from 'joi';

export const NUMBER_COMMA_STRING = joi
  .string()
  .regex(/\d((,\d)*$|$)/)
  .message('Debe ser un id o un listado de ids separados por coma ex: 1|1,2,3');

export const STRING_COMMA_STRING = joi
  .string()
  .regex(/[a-zA-Z_]+((,[a-zA-Z_]+)*$|$)/)
  .message(
    `Debe ser un id o un listado de cadenas de texto separados por coma 
    ex: manage|manage_roles,manage_users`,
  );
