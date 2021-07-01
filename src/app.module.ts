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

@Module({
  imports: [
    System_configModule,
    AuthModule,
    RolesModule,
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
        };
      },
      inject: [ConfigService],
    }),
    FunctionalitiesModule,
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
