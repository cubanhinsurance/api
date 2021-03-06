import { ConnectionOptions } from 'typeorm';

const DB: ConnectionOptions = {
  type: 'postgres',
  port: 5432,
  host: 'vps',
  // host: '10.42.0.1',
  // host: '192.168.1.101',
  username: 'postgres',
  password: 'sequit0s',
  database: 'whofix',
  migrations: ['src/migrations/*{.ts,.js}'],
  entities: ['src/modules/**/*.entity{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations/',
  },
};

export = DB;
