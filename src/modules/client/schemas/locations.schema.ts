import * as joi from 'joi';
import { PAGINATION_SCHEMA } from 'src/lib/pagination.results';

const DPA_SCHEMA = joi.object({
  id: joi.number(),
  name: joi.string(),
});

export const CREATE_USER_LOCATION_SCHEMA = joi.object({
  address: joi.string().required(),
  name: joi.string().required(),
  geom: joi.object().description('GeoJson del punto').required(),
});

export const USER_LOCATION_SCHEMA = CREATE_USER_LOCATION_SCHEMA.keys({
  province: DPA_SCHEMA.required(),
  municipality: DPA_SCHEMA.required(),
  id: joi.number().required(),
});

export const USERS_LOCATIONS_SCHEMA = joi.array().items(USER_LOCATION_SCHEMA);

export const UPDATE_USER_LOCATION_SCHEMA = joi.object({
  address: joi.string().optional(),
  name: joi.string().optional(),
  geom: joi.object().description('GeoJson del punto').optional(),
});
