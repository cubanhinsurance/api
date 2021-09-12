import {MigrationInterface, QueryRunner} from "typeorm";

export class db1631418077258 implements MigrationInterface {
    name = 'db1631418077258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD "confirm_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP COLUMN "confirm_date"`);
    }

}
