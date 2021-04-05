import { object, string } from 'joi';

export const STRONG_PASSWORD_SCHEMA = string()
  .required()
  .regex(/(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8}/);

export const USER_NAME_SCHEMA = string()
  .required()
  .regex(/^[a-zA-Z0-9_]{4,}$/);

export const SIGN_IN_SCHEMA = object({
  username: string().required(),
  password: string().required(),
});
