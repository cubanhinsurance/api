import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionalitiesEntity } from '../entities/functionalities.entity';

@Injectable()
export class FunctionalitiesService {
  constructor(
    @InjectRepository(FunctionalitiesEntity)
    private funcs: Repository<FunctionalitiesEntity>,
  ) {}

  async getFunctionalitiesList() {
    return await this.funcs.find();
  }
}
