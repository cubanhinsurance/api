import * as joi from 'joi';

export const BUY_LICENSE_SCHEMA = joi.object({
  license: joi.number().required(),
  username: joi.string().optional(),
  amount: joi.number().optional().default(1),
});

export const PAYMENT_EXECUTION_SCHEMA = joi.object({
  operationId: joi.string().required(),
  payGateway: joi.number().required(),
  amount: joi.number().required(),
  coin: joi.number().optional(),
});
