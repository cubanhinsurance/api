import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum EMAIL_SERVICE {
  GMAIL = 'gmail',
}

type AUTH = {
  username: string;
  password: string;
};

export type EMAIL_CONFIG =
  | {
      service: EMAIL_SERVICE;
      auth: AUTH;
    }
  | {
      host: string;
      port: number;
      secure: boolean;
      auth: AUTH;
    };

export interface SYS_CONFIG {
  email?: EMAIL_CONFIG;
}

@Entity({
  schema: 'config',
  name: 'app_config',
})
export class SystemConfigEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    type: 'jsonb',
  })
  config: SYS_CONFIG;
}
