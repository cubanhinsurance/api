import { boolean, date, number, object, string, ref } from 'joi';

export const CREATE_ISSUE_SCHEMA = object({
  type: number().required(),
  scheduled: boolean().optional().default(false),
  scheduled_description: string().optional(),
  date: date().optional(),
  description: string().optional(),
  expiration_date: date().optional(),
  max: number().optional(),
  maxDistance: number().optional(),
  data: object().unknown().optional(),
});

export const ISSUE_APPLICATION = object({
  message: string().optional(),
  min_price: number().min(0).required(),
  max_price: number().min(ref('min_price')).required(),
  min_date: date().optional(),
  max_date: date().min(ref('min_date')).optional(),
});
