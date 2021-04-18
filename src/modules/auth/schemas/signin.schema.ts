import { array, boolean, number, object, string } from 'joi';

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

export const USER_INFO_SCHEMA = object({
  name: string(),
  lastname: string(),
  isRoot: boolean(),
  id: number(),
  photo: string().base64(),
  isTech: boolean(),
  isAgent: boolean(),
  tools: array().items(string()),
});
