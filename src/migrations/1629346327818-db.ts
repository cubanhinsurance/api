import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629346327818 implements MigrationInterface {
    name = 'db1629346327818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ratings" ADD "tech_review" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ratings" DROP COLUMN "tech_review"`);
    }

}
