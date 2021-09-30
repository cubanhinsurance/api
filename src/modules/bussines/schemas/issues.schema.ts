import * as joi from 'joi';
import { ISSUE_APPLICATION_STATE } from '../entities/issues_applications.entity';

export const CREATE_ISSUE_SCHEMA = joi.object({
  type: joi.number().required(),
  scheduled: joi.boolean().optional().default(false),
  scheduled_description: joi.string().optional(),
  date: joi.date().optional(),
  description: joi.string().optional(),
  expiration_date: joi.date().optional(),
  max: joi.number().optional(),
  maxDistance: joi.number().optional(),
  data: joi.object().unknown().optional(),
});

export const ISSUE_APPLICATION = joi.object({
  message: joi.string().optional(),
  min_price: joi.number().min(0).required(),
  max_price: joi.number().min(joi.ref('min_price')).required(),
  min_date: joi.date().optional(),
  max_date: joi.date().min(joi.ref('min_date')).optional(),
});

export const ISSUES_APPLICATION_STATES = joi
  .string()
  .valid(...Object.values(ISSUE_APPLICATION_STATE));

export const RATING_SCHEMA = joi.object({
  date: joi.date().optional(),
  rating: joi.number().min(-5).max(5).required(),
  like: joi.boolean().default(true).optional(),
  description: joi.string().required(),
});
