/*
https://docs.nestjs.com/providers#services
*/

import { InjectRepository } from '@nestjs/typeorm';
import {
  TypeOrmEntityService,
  columns,
  rel,
  TypeOrmService,
} from '@atlasjs/typeorm-crud';
import { findOrFail } from 'src/lib/typeorm/id_colection_handler';
import { CoinsEntity } from 'src/modules/enums/entities/coins.entity';
import { LicensesTypesEntity } from 'src/modules/enums/entities/licenses_types.entity';
import { FindConditions, Repository } from 'typeorm';
import { LicensesEntity } from '../entities/licenses.entity';

@TypeOrmEntityService<LicensesService, LicensesEntity>({
  model: {
    type: LicensesEntity,
    name: 'Licencias',
    id: 'licenses',
    relations: rel<LicensesEntity>({
      coin: {
        columns: columns<CoinsEntity>(['name', 'id']),
      },
      type: {},
      coins: {
        columns: columns<CoinsEntity>(['name', 'id']),
      },
    }),
  },
})
export class LicensesService extends TypeOrmService<LicensesEntity> {
  constructor(
    @InjectRepository(LicensesEntity)
    private licensesEntity: Repository<LicensesEntity>,
    @InjectRepository(LicensesTypesEntity)
    private licensesTypesEntity: Repository<LicensesTypesEntity>,
    @InjectRepository(CoinsEntity)
    private coinsEntity: Repository<CoinsEntity>,
  ) {
    super(licensesEntity as any);
  }

  async getLicensesTypes() {
    return await this.licensesTypesEntity.find({
      select: ['id', 'name', 'description'],
    });
  }

  async createLicense() {}

  async updateLicense() {}
}
