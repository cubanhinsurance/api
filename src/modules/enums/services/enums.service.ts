import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateHabilityDto,
  CreateHabilityGroupDto,
} from '../dtos/habilities.dto';
import { HabilitiesEntity } from '../entities/habilities.entity';
import { HabilitiesGroupsEntity } from '../entities/habilities_groups.entity';
import { HabilitiesRequirementsEntity } from '../entities/habilities_reqs.entity';
import { MunicialitiesEntity } from '../entities/municipalities.entity';
import { ProvincesEntity } from '../entities/provinces.entity';

@Injectable()
export class EnumsService {
  constructor(
    @InjectRepository(ProvincesEntity)
    private provinces: Repository<ProvincesEntity>,
    @InjectRepository(MunicialitiesEntity)
    private muncs: Repository<MunicialitiesEntity>,
    @InjectRepository(HabilitiesEntity)
    private habilities: Repository<HabilitiesEntity>,
    @InjectRepository(HabilitiesRequirementsEntity)
    private habilities_reqs: Repository<HabilitiesRequirementsEntity>,
    @InjectRepository(HabilitiesGroupsEntity)
    private habilities_groups: Repository<HabilitiesGroupsEntity>,
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

  async getHabilitiesGroups() {
    return await this.habilities_groups.find({
      relations: ['habilities', 'habilities.requirements'],
    });
  }

  async createHabilitiesGroups(data: CreateHabilityGroupDto) {
    const exists = await this.habilities_groups.findOne({
      name: data.name,
    });

    if (exists)
      throw new ConflictException(`Ya existe un grupo llamado: ${data.name}`);

    return await this.habilities_groups.save(data);
  }

  async createHability(group: number, data: CreateHabilityDto) {
    const grp = await this.habilities_groups.findOne({
      id: group,
    });

    if (!grp) throw new NotFoundException(`Grupo no existe`);

    return await this.habilities.save({ ...data, group: grp });
  }
}
