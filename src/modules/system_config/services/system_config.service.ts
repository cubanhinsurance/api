import { ConfigService } from '@atlasjs/config';
import { Injectable } from '@nestjs/common';

interface SystemConfig {
  before_alerts_time: number;
  extra_renueval_time: number;
}

@Injectable()
export class System_configService {
  private config: SystemConfig;
  constructor({
    config: {
      system_config: {
        subscriptions: { before_alerts_time, extra_renueval_time },
      },
    },
  }: ConfigService) {
    this.config = {
      before_alerts_time,
      extra_renueval_time,
    };
  }
}
