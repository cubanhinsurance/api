import { ConfigService } from '@atlasjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { REDIS_BROKER } from 'src/lib/microservice/broker';
import { ValidTechLicense } from '../auth/guards/activeTech.guard';
import { GisModule } from '../gis/gis.module';
import { UsersModule } from '../users/users.module';
import { IoController } from './controllers/io.controller';
import { AgentsIoService } from './services/agents_io.service';
import { ClientsIoService } from './services/clients_io.service';
import { IssuesCacheService } from './services/issues_cache.service';
import { TechsIoService } from './services/techs_io.service';

@Module({
  imports: [
    GisModule,
    UsersModule,
    REDIS_BROKER,
    JwtModule.registerAsync({
      useFactory: (c: ConfigService) => {
        return {
          secret: c.config.auth.secret,
          signOptions: { expiresIn: '4h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [IoController],
  providers: [
    IssuesCacheService,
    AgentsIoService,
    ClientsIoService,
    TechsIoService,
  ],
  exports: [
    IssuesCacheService,
    AgentsIoService,
    ClientsIoService,
    TechsIoService,
  ],
})
export class IoModule {}
