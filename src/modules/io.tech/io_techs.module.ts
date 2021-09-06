import { ConfigService } from 'nestjs-rconfig-module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { REDIS_BROKER } from 'src/lib/microservice/broker';
import { BussinesModule } from '../bussines/bussines.module';
import { UsersModule } from '../users/users.module';
import { TechsIoController } from './controllers/io.controller';
import { TechsIoService } from './services/techs_io.service';

@Module({
  imports: [
    UsersModule,
    BussinesModule,
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
  controllers: [TechsIoController],
  providers: [TechsIoService],
  exports: [TechsIoService],
})
export class IoTechsModule {}
