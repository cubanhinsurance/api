/*
https://docs.nestjs.com/providers#services
*/

import { Inject, Injectable } from '@nestjs/common';
import { MAIL_CONFIG, resolve } from './common';
import { createTransport, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
  private transport: Transporter;
  private _config: MAIL_CONFIG;
  constructor(@Inject('config') config: MAIL_CONFIG) {
    this.config = config;
    if (config.refresh)
      config.refresh.subscribe((cfg) => {
        this.config = cfg;
      });
  }

  private updateTransport() {
    const { auth, host, port, secure, ...cfg } = this._config;
    this.transport = createTransport({
      connectionTimeout: 10000,
      host,
      secure,
      port: port ?? 587,
      auth: {
        user: auth.username,
        pass: auth.password,
      },
    });
  }

  get config(): MAIL_CONFIG {
    return this._config;
  }

  set config(config: MAIL_CONFIG) {
    this._config = config;
    this.updateTransport();
  }

  async send(mail: Mail.Options) {
    return await this.transport.sendMail(mail);
  }
}
