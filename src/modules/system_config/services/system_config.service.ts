import { ConfigService } from '@atlasjs/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigEntity, SYS_CONFIG } from '../entities/sysconfig.entity';

@Injectable()
export class System_configService implements OnModuleInit {
  private _config: SystemConfigEntity;
  constructor(
    @InjectRepository(SystemConfigEntity)
    private configEntity: Repository<SystemConfigEntity>,
  ) {}

  async onModuleInit() {
    this._config = await this.configEntity.findOne('app');

    if (!this._config) {
      this._config = { id: 'app', config: {} };
      await this.updateConfig();
    }
  }

  async updateConfig() {
    this._config = await this.configEntity.save(this._config);
  }

  async setConfig(config: SYS_CONFIG) {
    this._config.config = config;
    await this.updateConfig();
  }

  get config(): SYS_CONFIG {
    return this._config?.config;
  }
}
