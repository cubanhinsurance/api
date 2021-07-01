import { MigrationInterface, QueryRunner } from 'typeorm';

export class db1625104145772 implements MigrationInterface {
  name = 'db1625104145772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE schema config`);
    await queryRunner.query(
      `CREATE TABLE "config"."app_config" ("id" character varying NOT NULL, "config" jsonb NOT NULL, CONSTRAINT "PK_8f86c05c83f9818ec8e4b570dc5" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "config"."app_config"`);
  }
}
