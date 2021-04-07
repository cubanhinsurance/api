import { array, number, object, string } from 'joi';

export const PROVINCE_SCHEMA = object({
  name: string().required(),
  id: number().required(),
  short_name: string().optional(),
  code: string().required(),
});

export const PROVINCES_SCHEMA = array().items(PROVINCE_SCHEMA);

export const MUNICIPALITY_SCHEMA = object({
  name: string().required(),
  id: number().required(),
  short_name: string().optional(),
  code: string().required(),
  province: PROVINCE_SCHEMA,
});

export const MUNICIPALITIES_SCHEMA = array().items(MUNICIPALITY_SCHEMA);
