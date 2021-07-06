import { MailService } from './mail.service';
import { DynamicModule, Module } from '@nestjs/common';
import { ASYNC_MAIL_CONFIG, MAIL_CONFIG, resolve } from './common';

@Module({})
export class MailModule {
  static register(config: MAIL_CONFIG, scope?: string): DynamicModule {
    return {
      module: MailModule,
      global: config.global ?? false,
      providers: [
        MailService,
        {
          provide: 'config',
          useValue: config,
        },
        {
          provide: resolve(scope, false),
          useExisting: MailService,
        },
      ],
      exports: [
        {
          provide: resolve(scope, false),
          useExisting: MailService,
        },
      ],
    };
  }

  static registerAsync(
    { useFactory, imports, inject, ...config }: ASYNC_MAIL_CONFIG,
    scope?: string,
  ): DynamicModule {
    return {
      module: MailModule,
      global: config.global ?? false,
      imports,
      providers: [
        MailService,
        {
          provide: 'config',
          useFactory,
          inject,
        },
        {
          provide: resolve(scope, false),
          useExisting: MailService,
        },
      ],
      exports: [
        {
          provide: resolve(scope, false),
          useExisting: MailService,
        },
      ],
    };
  }
}
