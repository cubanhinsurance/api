import * as joi from 'joi';

export const STRONG_PASSWORD_SCHEMA = joi
  .string()
  .regex(/(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8}/);

export const USER_NAME_SCHEMA = joi.string().regex(/^[a-zA-Z0-9_]{4,}$/);

export const SIGN_IN_SCHEMA = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
});

export const USER_INFO_SCHEMA = joi.object({
  name: joi.string(),
  lastname: joi.string(),
  isRoot: joi.boolean(),
  id: joi.number(),
  photo: joi.string().base64(),
  isTech: joi.boolean(),
  isAgent: joi.boolean(),
  tools: joi.array().items(joi.string()),
});
