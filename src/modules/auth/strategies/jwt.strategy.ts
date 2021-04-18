import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@atlasjs/config';
import { AuthService } from '../services/auth.service';

const cookieExtractor = (req): string =>
  req && req.cookies && req.cookies.Authorization
    ? req.cookies.Authorization
    : null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private auth: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.config.auth.secret,
    });
  }

  async validate(user: any) {
    return await this.auth.getUserInfo(user.username);
  }
}
