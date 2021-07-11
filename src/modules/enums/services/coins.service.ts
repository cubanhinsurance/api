/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmEntityService } from 'src/lib/typeorm-crud/decorators/typeorm.decorators';
import { TypeOrmService } from '../../../lib/typeorm-crud/typeorm.service';
import { CoinsEntity } from '../entities/coins.entity';
import * as j2s from 'joi-to-swagger';
import { object } from 'joi';
import { SelectQueryBuilder } from 'typeorm';

@TypeOrmEntityService({
  model: {
    type: CoinsEntity,
    id: 'coins',
    name: 'Monedas',
  },
})
export class CoinsService extends TypeOrmService<CoinsEntity> {
  constructor(@InjectRepository(CoinsEntity) coins) {
    super(coins);
  }

  async getCoins() {
    return await this.find();
  }
}