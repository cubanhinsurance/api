import { ConfigService } from 'nestjs-rconfig-module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { REDIS_BROKER } from 'src/lib/microservice/broker';
import { BussinesModule } from '../bussines/bussines.module';
import { UsersModule } from '../users/users.module';
import { ClientsIoController } from './controllers/io.controller';
import { ClientsIoService } from './services/clients_io.service';

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
  controllers: [ClientsIoController],
  providers: [ClientsIoService],
  exports: [ClientsIoService],
})
export class IoClientModule {}
