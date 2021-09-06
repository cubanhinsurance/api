import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Exception } from '../exceptions/exception';

@Injectable()
export class ExceptionsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err.isAxiosError === true)
          throw new HttpException(
            err?.response?.statusText ?? '',
            err?.response?.status ?? 500,
          );
        if (err instanceof HttpException) throw err;
        if ((err.code || err.status) && err.message) {
          throw new HttpException(err.message, err.code ?? err.status);
        }

        if (err instanceof HttpException) throw err;
        if (err instanceof Exception)
          throw new HttpException(err.message, err.code);
        throw new InternalServerErrorException(err.message);
      }),
    );
  }
}
