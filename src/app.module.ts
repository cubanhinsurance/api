import { LicensesService } from './modules/bussines/services/licenses.service';
import { LicensesController } from './modules/bussines/controllers/licenses.controller';
import { System_configModule } from './modules/system_config/system_config.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@atlasjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionalitiesModule } from './modules/functionalities/functionalities.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';
import { UsersModule } from './modules/users/users.module';
import { ExceptionsInterceptor } from './lib/interceptors/exceptions.interceptor';
import { RolesModule } from './modules/roles/roles.module';
import { EnumsModule } from './modules/enums/enums.module';
import { MulterModule } from '@nestjs/platform-express';
import { CookieInterceptor } from './modules/auth/interceptors/cookie.interceptor';
import { ClientModule } from './modules/client/client.module';
import { BussinesModule } from './modules/bussines/bussines.module';
import { APP_MAIL_MODULE } from './common/mailer.module';
import { MailModule } from './modules/mail/mail.module';
import { System_configService } from './modules/system_config/services/system_config.service';
import { MAIL_CONFIG } from './modules/mail/common';
import { Observable } from 'rxjs';

@Module({
  imports: [
    System_configModule,
    AuthModule,
    RolesModule,
    ClientModule,
    BussinesModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory({ config }: ConfigService) {
        return {
          type: 'postgres',
          port: config.ormconfig.port,
          host: config.ormconfig.host,
          username: config.ormconfig.username,
          password: config.ormconfig.password,
          database: config.ormconfig.database,
          subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          // synchronize: true,
          keepConnectionAlive: true,
          // migrationsRun: true,
        };
      },
      inject: [ConfigService],
    }),
    FunctionalitiesModule,
    MailModule.registerAsync({
      global: true,
      // imports: [System_configModule],
      async useFactory(service: System_configService): Promise<MAIL_CONFIG> {
        // await service.preload();
        return {
          global: true,
          ...service.config?.email,
          refresh: new Observable<MAIL_CONFIG>((ob) => {
            service.updated$.subscribe((cfg) => {
              ob.next(cfg.email);
            });
          }),
        };
      },
      inject: ['APP_CONFIG'],
    }),
    UsersModule,
    EnumsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CookieInterceptor,
    },
  ],
})
export class AppModule {}
