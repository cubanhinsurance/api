import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum EMAIL_SERVICE {
  GMAIL = 'gmail',
}

export interface EMAIL_CONFIG {
  service: EMAIL_SERVICE;
  auth?: {
    username: string;
    password: string;
  };
}
{
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
  config: object;
}
