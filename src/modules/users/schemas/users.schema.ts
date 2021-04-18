import { array, boolean, date, number, object, ref, string } from 'joi';
import { PAGE_RESULT_SCHEMA } from 'src/lib/schemas/pagination.schema';
import {
  STRONG_PASSWORD_SCHEMA,
  USER_NAME_SCHEMA,
} from 'src/modules/auth/schemas/signin.schema';
import { HABILITIES_SCHEMA } from 'src/modules/enums/schemas/habilities.schema';

export const USERS_SCHEMA = object({
  username: USER_NAME_SCHEMA,
  password: STRONG_PASSWORD_SCHEMA,
  name: string().required(),
  lastname: string().required(),
  email: string().email().optional(),
  telegram_id: string().optional(),
}).required();

export const UPDATE_USER_SCHEMA = object({
  last_password: STRONG_PASSWORD_SCHEMA.optional(),
  new_password: STRONG_PASSWORD_SCHEMA.optional(),
  confirm_password: ref('new_password'),
  name: string().optional(),
  last_name: string().optional(),
  email: string().email().optional(),
  phone_number: string().optional(),
  telegram_id: string().optional(),
  active: boolean().optional(),
  expiration_date: date().optional().allow(null),
})
  .required()
  .with('new_password', ['last_password', 'confirm_password']);

export const AGENTS_SCHEMA = object({
  new_user: USERS_SCHEMA.optional(),
  username: string().optional(),
  role: number().integer().required(),
  expiration_date: date().optional(),
}).xor('username', 'new_user');

export const UPDATE_AGENT_SCHEMA = object({
  role: number().integer().optional(),
  active: boolean().optional(),
  expiration_date: date().optional().allow(null),
}).required();

export const TECH_SCHEMA = object({
  new_user: USERS_SCHEMA.optional(),
  username: string().optional(),
  expiration_date: date().optional(),
  habilities: array().items(number()).min(1).required(),
}).xor('username', 'new_user');

export const UPDATE_TECH_SCHEMA = object({
  active: boolean().optional(),
  expiration_date: date().optional().allow(null),
  habilities: array().items(number()).min(0).optional(),
});

export const USER_QUERY_RESULT = object({
  id: number(),
  name: string(),
  lastname: string(),
  username: string(),
  email: string().email(),
  phone_number: string(),
  telegram_id: string(),
  active: boolean(),
  expiration_date: date(),
  photo: string().base64(),
  techniccian_info: object({
    user: number(),
    expiration_date: date(),
    active: boolean(),
    habilities: array().items(HABILITIES_SCHEMA),
  }),
  agent_info: object({
    user: number(),
    expiration_date: date(),
    active: boolean(),
  }),
});

export const USERS_QUERY_RESULTS = PAGE_RESULT_SCHEMA.keys({
  data: array().items(USER_QUERY_RESULT),
});
