import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesEntity } from '../entities/roles.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolesEntity) private roles: Repository<RolesEntity>,
  ) {}

  async getRolesList() {
    return await this.roles.find();
  }
}
