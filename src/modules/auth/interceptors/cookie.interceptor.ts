import { ConfigService } from '@atlasjs/config';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UPDATE_COOKIE } from '../decorators/login.decorator';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((resp) => {
        const hasCookie = this.reflector.getAllAndOverride<string>(
          UPDATE_COOKIE,
          [context.getHandler(), context.getClass()],
        );

        if (!!hasCookie) {
          const response = context.switchToHttp().getResponse();
          response.cookie('Authorization', resp, {
            maxAge: 14400000,
            httpOnly: true,
          });
        }
      }),
    );
  }
}
