import * as joi from 'joi';

export const PROVINCE_SCHEMA = joi.object({
  name: joi.string().required(),
  id: joi.number().required(),
  short_name: joi.string().optional(),
  code: joi.string().required(),
});

export const PROVINCES_SCHEMA = joi.array().items(PROVINCE_SCHEMA);

export const MUNICIPALITY_SCHEMA = joi.object({
  name: joi.string().required(),
  id: joi.number().required(),
  short_name: joi.string().optional(),
  code: joi.string().required(),
  province: PROVINCE_SCHEMA,
});

export const MUNICIPALITIES_SCHEMA = joi.array().items(MUNICIPALITY_SCHEMA);
