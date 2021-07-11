/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmEntityService } from 'src/lib/typeorm-crud/decorators/typeorm.decorators';
import { findOrFail } from 'src/lib/typeorm/id_colection_handler';
import { CoinsEntity } from 'src/modules/enums/entities/coins.entity';
import { LicensesTypesEntity } from 'src/modules/enums/entities/licenses_types.entity';
import { FindConditions, FindManyOptions, Repository } from 'typeorm';
import { LicensesEntity } from '../entities/licenses.entity';
import { UserLicensesEntity } from '../entities/user_licenses.entity';

// @TypeOrmEntityService({
//   model: {
//     type: LicensesEntity,
//     name: 'Licencias',
//     id: 'license',
//   },
// })
export class LicensesService {
  constructor(
    @InjectRepository(UserLicensesEntity)
    private userLicensesEntity: Repository<UserLicensesEntity>,
    @InjectRepository(LicensesEntity)
    private licensesEntity: Repository<LicensesEntity>,
    @InjectRepository(LicensesTypesEntity)
    private licensesTypesEntity: Repository<LicensesTypesEntity>,
    @InjectRepository(CoinsEntity)
    private coinsEntity: Repository<CoinsEntity>,
  ) {}

  async getLicensesTypes() {
    return await this.licensesTypesEntity.find();
  }

  async getLicenses(actives: boolean = true) {
    const filters: FindConditions<LicensesEntity> = {
      active: actives,
    };

    return await this.licensesEntity.find({
      where: filters,
    });
  }

  async createLicense({
    coin,
    price,
    time,
    type,
    config,
    expiration_date,
    description,
    photo,
  }: {
    type: number | LicensesTypesEntity;
    expiration_date?: Date;
    config?: any;
    price: number;
    coin: number | CoinsEntity;
    time: number;
    description?: string;
    photo?: Buffer;
  }) {
    const created = await this.licensesEntity.save({
      coin:
        type instanceof CoinsEntity
          ? type
          : await findOrFail<CoinsEntity>(coin as number, this.coinsEntity),
      type:
        type instanceof LicensesTypesEntity
          ? type
          : await findOrFail<LicensesTypesEntity>(
              type as number,
              this.licensesTypesEntity,
            ),
      expiration_date,
      description,
      photo: photo ? photo.toString('base64') : null,
      config,
      time,
      price,
    });
  }
}
