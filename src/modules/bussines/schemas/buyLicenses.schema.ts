import { number, object, string } from 'joi';

export const BUY_LICENSE_SCHEMA = object({
  license: number().required(),
  username: string().optional(),
  amount: number().optional().default(1),
});

export const PAYMENT_EXECUTION_SCHEMA = object({
  operationId: string().required(),
  payGateway: number().required(),
  amount: number().required(),
  coin: number().optional(),
});
