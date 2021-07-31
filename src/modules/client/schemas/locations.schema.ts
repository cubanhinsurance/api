import { array, number, object, string } from 'joi';
import { PAGINATION_SCHEMA } from 'src/lib/pagination.results';

const DPA_SCHEMA = object({
  id: number(),
  name: string(),
});

export const CREATE_USER_LOCATION_SCHEMA = object({
  address: string().required(),
  name: string().required(),
  geom: object().description('GeoJson del punto').required(),
});

export const USER_LOCATION_SCHEMA = CREATE_USER_LOCATION_SCHEMA.keys({
  province: DPA_SCHEMA.required(),
  municipality: DPA_SCHEMA.required(),
  id: number().required(),
});

export const USERS_LOCATIONS_SCHEMA = array().items(USER_LOCATION_SCHEMA);

export const UPDATE_USER_LOCATION_SCHEMA = object({
  address: string().optional(),
  name: string().optional(),
  geom: object().description('GeoJson del punto').optional(),
});
