import { ConfigService } from '@atlasjs/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigEntity } from '../entities/sysconfig.entity';

@Injectable()
export class System_configService implements OnModuleInit {
  private config: object;
  constructor(
    @InjectRepository(SystemConfigEntity)
    private configEntity: Repository<SystemConfigEntity>,
  ) {}

  onModuleInit() {}
}
