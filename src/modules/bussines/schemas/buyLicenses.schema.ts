import { number, object, string } from 'joi';

export const BUY_LICENSE_SCHEMA = object({
  license: number().required(),
  username: string().optional(),
  amount: number().optional().default(1),
});
