import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import {
  LocalAgentStrategy,
  LocalStrategy,
  LocalTechStrategy,
} from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'rxjs';
import { ConfigService } from '@atlasjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      useFactory({ config }: ConfigService) {
        return {
          secret: config.auth.secret,
          signOptions: { expiresIn: config.auth.expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    LocalTechStrategy,
    LocalAgentStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
