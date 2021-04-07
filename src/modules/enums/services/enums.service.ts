import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MunicialitiesEntity } from '../entities/municipalities.entity';
import { ProvincesEntity } from '../entities/provinces.entity';

@Injectable()
export class EnumsService {
  constructor(
    @InjectRepository(ProvincesEntity)
    private provinces: Repository<ProvincesEntity>,
    @InjectRepository(MunicialitiesEntity)
    private muncs: Repository<MunicialitiesEntity>,
  ) {}

  async getProvinces() {
    return await this.provinces.find({
      select: ['id', 'name', 'short_name', 'code'],
    });
  }

  async getMunicipalities(provinces?: number | number[]) {
    const provincesFilter = provinces
      ? typeof provinces == 'number'
        ? [provinces]
        : provinces
      : null;
    return await this.muncs.find({
      select: ['id', 'code', 'name', 'short_name'],
      relations: ['province'],
      where: provincesFilter ? { province: In(provincesFilter) } : null,
    });
  }
}
