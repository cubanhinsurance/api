import {MigrationInterface, QueryRunner} from "typeorm";

export class db1627442904487 implements MigrationInterface {
    name = 'db1627442904487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."tech_applicant" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."tech_applicant" DROP COLUMN "deleted_at"`);
    }

}
