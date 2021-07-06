import { Inject } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

interface AUTH_CONFIG {
  username: string;
  password: string;
}

export enum MAIL_SERVICES {
  GMAIL = 'gmail',
}

export interface MAIL_CONFIG {
  host: string;
  port?: number;
  secure?: boolean;
  auth: AUTH_CONFIG;
  global?: boolean;
  refresh?: Subject<MAIL_CONFIG> | Observable<MAIL_CONFIG>;
}

export interface ASYNC_MAIL_CONFIG {
  global?: boolean;
  useFactory: (any?) => MAIL_CONFIG | Promise<MAIL_CONFIG>;
  inject?: any[];
  imports?: any[];
}

const unique = Math.random();
export const resolve = (
  scope: string = 'default',
  config: boolean = false,
): string => `mailc-${unique}-scope-${config ? 'config' : 'service'}`;

export const InjectMailService = (scope?: string) => Inject(resolve(scope));
