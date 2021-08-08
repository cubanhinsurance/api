import { ConfigService } from '@atlasjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { REDIS_BROKER } from 'src/lib/microservice/broker';
import { UsersModule } from '../users/users.module';
import { IoController } from './controllers/io.controller';
import { AgentsIoService } from './services/agents_io.service';
import { ClientsIoService } from './services/clients_io.service';
import { TechsIoService } from './services/techs_io.service';

@Module({
  imports: [
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
  providers: [AgentsIoService, ClientsIoService, TechsIoService],
  exports: [AgentsIoService, ClientsIoService, TechsIoService],
})
export class IoModule {}
