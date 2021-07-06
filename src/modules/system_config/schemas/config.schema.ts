import { alternatives, boolean, number, object, string, valid } from 'joi';
import { EMAIL_SERVICE } from '../entities/sysconfig.entity';

const AUTH_SCHEMA = object({
  username: string().required(),
  password: string().required(),
});

export const EMAIL_CONFIG_SCHEMA = object({
  host: string().required(),
  port: number().required(),
  secure: boolean().required(),
  auth: AUTH_SCHEMA,
});

export const CONFIG_SCHEMA = object({
  email: EMAIL_CONFIG_SCHEMA.optional().allow(null),
});
