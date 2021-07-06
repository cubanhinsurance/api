import { ConfigService } from '@atlasjs/config';
import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'rxjs';
import { InjectMailService } from 'src/modules/mail/common';
import { MailService } from 'src/modules/mail/mail.service';
import { Repository } from 'typeorm';
import { SystemConfigEntity, SYS_CONFIG } from '../entities/sysconfig.entity';

@Injectable()
export class System_configService {
  private _config: SystemConfigEntity;
  readonly updated$: Subject<SYS_CONFIG>;
  constructor(
    @InjectRepository(SystemConfigEntity)
    private configEntity: Repository<SystemConfigEntity>, // @InjectMailService() private mailer: MailService,
  ) {
    this.updated$ = new Subject<SYS_CONFIG>();
  }

  async preload() {
    this._config = await this.configEntity.findOne('app');
    if (!this._config) {
      this._config = { id: 'app', config: {} };
      await this.updateConfig();
    }
  }

  async updateConfig() {
    this._config = await this.configEntity.save(this._config);
    this.updated$.next(this._config.config);
    // this.mailer.config = {
    //   auth: this.config.email.auth,
    //   host: this.config.email.host,
    //   port: this.config.email.port,
    //   secure: this.config.email.secure,
    // };
  }

  async setConfig(config: SYS_CONFIG) {
    this._config.config = config;
    await this.updateConfig();
  }

  get config(): SYS_CONFIG {
    return this._config?.config;
  }
}
