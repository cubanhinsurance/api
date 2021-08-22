import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629600436196 implements MigrationInterface {
    name = 'db1629600436196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD "message" character varying`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD "min_price" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD "max_price" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD "min_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD "max_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP COLUMN "max_date"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP COLUMN "min_date"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP COLUMN "max_price"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP COLUMN "min_price"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP COLUMN "message"`);
    }

}
