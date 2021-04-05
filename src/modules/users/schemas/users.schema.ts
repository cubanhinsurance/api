import { boolean, date, number, object, ref, string } from 'joi';
import {
  STRONG_PASSWORD_SCHEMA,
  USER_NAME_SCHEMA,
} from 'src/modules/auth/schemas/signin.schema';

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
