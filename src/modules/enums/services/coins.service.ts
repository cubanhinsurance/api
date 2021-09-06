/*
https://docs.nestjs.com/providers#services
*/

import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmEntityService, TypeOrmService } from 'nestjs-typeorm-crud';
import { CoinsEntity } from '../entities/coins.entity';

@TypeOrmEntityService<CoinsService, CoinsEntity>({
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

  async a() {
    return [];
  }
}
