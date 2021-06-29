import { array, binary, boolean, date, number, object, ref, string } from 'joi';
import { PAGE_RESULT_SCHEMA } from 'src/lib/schemas/pagination.schema';
import {
  STRONG_PASSWORD_SCHEMA,
  USER_NAME_SCHEMA,
} from 'src/modules/auth/schemas/signin.schema';
import { HABILITIES_SCHEMA } from 'src/modules/enums/schemas/habilities.schema';
import { USER_TYPE } from '../services/users.service';

export const USERS_SCHEMA = object({
  username: USER_NAME_SCHEMA.required(),
  password: STRONG_PASSWORD_SCHEMA.required(),
  name: string().required(),
  lastname: string().required(),
  email: string().email().optional(),
  telegram_id: string().optional(),
  photo: binary().optional(),
})
  .required()
  .unknown();

export const REGISTER_USER_SCHEMA = USERS_SCHEMA.keys({
  email: string().email().required(),
});

export const UPDATE_USER_SCHEMA = object({
  last_password: STRONG_PASSWORD_SCHEMA.optional(),
  new_password: STRONG_PASSWORD_SCHEMA.optional(),
  confirm_password: ref('new_password'),
  name: string().optional(),
  username: USER_NAME_SCHEMA.optional(),
  lastname: string().optional(),
  email: string().email().optional(),
  phone_number: string().optional(),
  telegram_id: string().optional(),
  active: boolean().optional(),
  expiration_date: date().optional().allow(null),
  photo: binary().optional(),
  confirmed: boolean().optional(),
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
  confirmation_photo: binary().optional(),
  address: string().required(),
  confirmed: boolean().required(),
  ci: string().required().length(11),
  province: number().required(),
  municipality: number().required(),
}).xor('username', 'new_user');

export const UPDATE_TECH_SCHEMA = object({
  active: boolean().optional(),
  expiration_date: date().optional().allow(null),
  habilities: array().items(number()).min(0).optional(),
  confirmation_photo: binary().optional(),
  address: string().optional(),
  confirmed: boolean().optional(),
  ci: string().optional().length(11),
  province: number().optional(),
  municipality: number().optional(),
})
  .with('province', 'municipality')
  .with('municipality', 'province');

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
    rating: number().min(1).max(5),
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

export const USERS_FILTERS = object({
  types: array()
    .items(string().valid(...Object.values(USER_TYPE)))
    .optional()
    .min(1),
  username: string().optional(),
  name: string().optional(),
  user_active: boolean().optional(),
  roles: array().items(number()).optional().min(1),
  agent_active: boolean().optional(),
  tech_active: boolean().optional(),
  ci: string().optional(),
  address: string().optional(),
  tech_provinces: array().items(number()).optional().min(1),
  tech_municipalities: array().items(number()).optional().min(1),
  tech_rating: number().optional().min(1).max(5),
  habilities: array().items(number()).optional().min(1),
});
