import { MAIL_CONFIG } from '../modules/mail/common';
import { MailModule } from '../modules/mail/mail.module';
import { System_configService } from '../modules/system_config/services/system_config.service';
import { System_configModule } from '../modules/system_config/system_config.module';

export const APP_MAIL_MODULE = MailModule.registerAsync({
  global: true,
  imports: [System_configModule],
  useFactory({ config }: System_configService): MAIL_CONFIG {
    return {
      global: true,
      ...config?.email,
    };
  },
  inject: [System_configService],
});
