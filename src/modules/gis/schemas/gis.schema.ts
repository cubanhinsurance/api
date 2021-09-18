import * as joi from 'joi';

export const LATITUDE_REGEX =
  /(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))/;
export const LONGITUDE_REGEX =
  /(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))/;

export const LON_LAT_REGEX =
  /((\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))),((\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?)))/;

export const LON_LAT_SCHEMA = joi
  .string()
  .regex(LON_LAT_REGEX)
  .example('23.123511,56.231272');
