import { boolean, date, number, object, string } from 'joi';

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
