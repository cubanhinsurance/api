import { ConnectionOptions } from 'typeorm';

const DB: ConnectionOptions = {
  type: 'postgres',
  port: 5432,
  host: 'localhost',
  username: 'postgres',
  password: 'postgres',
  database: 'whofix',
  migrations: ['src/migrations/*{.ts,.js}'],
  entities: ['src/modules/**/*.entity{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations/',
  },
};

export = DB;
