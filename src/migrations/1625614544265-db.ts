import {MigrationInterface, QueryRunner} from "typeorm";

export class db1625614544265 implements MigrationInterface {
    name = 'db1625614544265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" ADD "photo" character varying`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" DROP COLUMN "photo"`);
    }

}
