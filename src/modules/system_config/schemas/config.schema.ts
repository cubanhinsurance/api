import * as joi from 'joi';
import { EMAIL_SERVICE } from '../entities/sysconfig.entity';

const AUTH_SCHEMA = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
});

export const EMAIL_CONFIG_SCHEMA = joi.object({
  host: joi.string().required(),
  port: joi.number().required(),
  secure: joi.boolean().required(),
  auth: AUTH_SCHEMA,
});

export const CONFIG_SCHEMA = joi.object({
  email: EMAIL_CONFIG_SCHEMA.optional().allow(null),
});
