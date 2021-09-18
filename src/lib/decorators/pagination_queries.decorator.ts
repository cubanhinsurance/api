import { Param, Query } from '@nestjs/common';
import * as joi from 'joi';
import { JoiPipe } from '../pipes/joi.pipe';

export const Page = () =>
  Query(
    'page',
    new JoiPipe(joi.number().min(1).integer().optional().default(1)),
  );
export const PageSize = (max: number = 50, default_value: number = 20) =>
  Query(
    'page_size',
    new JoiPipe(
      joi.number().max(max).integer().optional().default(default_value),
    ),
  );
