import {MigrationInterface, QueryRunner} from "typeorm";

export class db1627161286116 implements MigrationInterface {
    name = 'db1627161286116'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."tech_applicant" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."tech_applicant" ALTER COLUMN "response_date" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."tech_applicant" ALTER COLUMN "response_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."tech_applicant" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
    }

}
