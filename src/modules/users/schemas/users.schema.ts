import * as joi from 'joi';
import { PAGE_RESULT_SCHEMA } from 'src/lib/schemas/pagination.schema';
import {
  STRONG_PASSWORD_SCHEMA,
  USER_NAME_SCHEMA,
} from 'src/modules/auth/schemas/signin.schema';
import { HABILITIES_SCHEMA } from 'src/modules/enums/schemas/habilities.schema';
import { USER_TYPE } from '../services/users.service';

export const USERS_SCHEMA = joi
  .object({
    username: USER_NAME_SCHEMA.required(),
    password: STRONG_PASSWORD_SCHEMA.required(),
    name: joi.string().required(),
    lastname: joi.string().required(),
    email: joi.string().email().optional(),
    telegram_id: joi.string().optional(),
    phone_number: joi.string().optional(),
    photo: joi.binary().optional(),
  })
  .required()
  .unknown();

export const REGISTER_USER_SCHEMA = USERS_SCHEMA.keys({
  email: joi.string().email().required(),
});

export const UPDATE_USER_SCHEMA = joi
  .object({
    last_password: STRONG_PASSWORD_SCHEMA.optional(),
    new_password: STRONG_PASSWORD_SCHEMA.optional(),
    confirm_password: joi.ref('new_password'),
    name: joi.string().optional(),
    username: USER_NAME_SCHEMA.optional(),
    lastname: joi.string().optional(),
    email: joi.string().email().optional(),
    phone_number: joi.string().optional(),
    telegram_id: joi.string().optional(),
    active: joi.boolean().optional(),
    expiration_date: joi.date().optional().allow(null),
    photo: joi.binary().optional(),
    confirmed: joi.boolean().optional(),
  })
  .required()
  .with('new_password', ['last_password', 'confirm_password']);

export const AGENTS_SCHEMA = joi
  .object({
    new_user: USERS_SCHEMA.optional(),
    username: joi.string().optional(),
    role: joi.number().integer().required(),
    expiration_date: joi.date().optional(),
  })
  .xor('username', 'new_user');

export const UPDATE_AGENT_SCHEMA = joi
  .object({
    role: joi.number().integer().optional(),
    active: joi.boolean().optional(),
    expiration_date: joi.date().optional().allow(null),
  })
  .required();

export const TECH_SCHEMA = joi
  .object({
    new_user: USERS_SCHEMA.optional(),
    username: joi.string().optional(),
    expiration_date: joi.date().optional(),
    habilities: joi.array().items(joi.number()).min(1).required(),
    confirmation_photo: joi.binary().optional(),
    address: joi.string().required(),
    confirmed: joi.boolean().required(),
    ci: joi.string().pattern(/\d{11,11}/),
    province: joi.number().required(),
    municipality: joi.number().required(),
  })
  .xor('username', 'new_user');

export const TECH_APP_SCHEMA = joi.object({
  habilities: joi.array().items(joi.number()).min(1).required(),
  address: joi.string().required(),
  ci: joi
    .string()
    .pattern(/\d{11,11}/)
    .required(),
  province: joi.number().required(),
  municipality: joi.number().required(),
  confirmation_photo: joi.binary().optional(),
});

export const UPDATE_TECH_SCHEMA = joi
  .object({
    active: joi.boolean().optional(),
    expiration_date: joi.date().optional().allow(null),
    habilities: joi.array().items(joi.number()).min(0).optional(),
    confirmation_photo: joi.binary().optional(),
    address: joi.string().optional(),
    confirmed: joi.boolean().optional(),
    ci: joi
      .string()
      .pattern(/\d{11,11}/)
      .optional(),
    province: joi.number().optional(),
    municipality: joi.number().optional(),
  })
  .with('province', 'municipality')
  .with('municipality', 'province');

export const USER_QUERY_RESULT = joi.object({
  id: joi.number(),
  name: joi.string(),
  lastname: joi.string(),
  username: joi.string(),
  email: joi.string().email(),
  phone_number: joi.string(),
  telegram_id: joi.string(),
  active: joi.boolean(),
  expiration_date: joi.date(),
  photo: joi.string().base64(),
  techniccian_info: joi.object({
    user: joi.number(),
    expiration_date: joi.date(),
    active: joi.boolean(),
    rating: joi.number().min(1).max(5),
    habilities: joi.array().items(HABILITIES_SCHEMA),
  }),
  agent_info: joi.object({
    user: joi.number(),
    expiration_date: joi.date(),
    active: joi.boolean(),
  }),
});

export const USERS_QUERY_RESULTS = PAGE_RESULT_SCHEMA.keys({
  data: joi.array().items(USER_QUERY_RESULT),
});

export const USERS_FILTERS = joi.object({
  types: joi
    .array()
    .items(joi.string().valid(...Object.values(USER_TYPE)))
    .optional()
    .min(1),
  username: joi.string().optional(),
  name: joi.string().optional(),
  user_active: joi.boolean().optional(),
  roles: joi.array().items(joi.number()).optional().min(1),
  agent_active: joi.boolean().optional(),
  tech_active: joi.boolean().optional(),
  ci: joi.string().optional(),
  address: joi.string().optional(),
  tech_provinces: joi.array().items(joi.number()).optional().min(1),
  tech_municipalities: joi.array().items(joi.number()).optional().min(1),
  tech_rating: joi.number().optional().min(1).max(5),
  habilities: joi.array().items(joi.number()).optional().min(1),
});

export const TECH_APPLICANTS_SCHEMA = joi.object({
  page: joi.number(),
  page_size: joi.number(),
  total: joi.number(),
  pages: joi.number(),
  data: joi.array().items(
    joi.object({
      id: joi.number().required(),
      user: joi.object({
        username: joi.string(),
        name: joi.string(),
        lastname: joi.string(),
      }),
      province: joi.object({ id: joi.number(), name: joi.string() }),
      municipality: joi.object({ id: joi.number(), name: joi.string() }),
      ci: joi.string(),
      date: joi.date(),
    }),
  ),
});

export const TECH_APPLICANT_SCHEMA = joi.object({
  id: joi.number().required(),
  user: joi.object({
    username: joi.string(),
    name: joi.string(),
    lastname: joi.string(),
  }),
  ci: joi.string(),
  date: joi.date(),
  address: joi.string(),
  province: joi.object({ id: joi.number(), name: joi.string() }),
  municipality: joi.object({ id: joi.number(), name: joi.string() }),
  habilities: joi.array().items(HABILITIES_SCHEMA),
  confirmation_photo: joi.string().base64(),
});
