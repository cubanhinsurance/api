import { System_configController } from './controllers/system_config.controller';
import { System_configService } from './services/system_config.service';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigEntity } from './entities/sysconfig.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemConfigEntity])],
  controllers: [System_configController],
  providers: [
    System_configService,
    {
      provide: 'APP_CONFIG',
      async useFactory(s: System_configService) {
        await s.preload();
        return s;
      },
      inject: [System_configService],
    },
  ],
  exports: [System_configService, 'APP_CONFIG'],
})
export class System_configModule {}
