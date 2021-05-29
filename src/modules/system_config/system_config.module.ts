import { System_configController } from './controllers/system_config.controller';
import { System_configService } from './services/system_config.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [System_configController],
  providers: [System_configService],
})
export class System_configModule {}
