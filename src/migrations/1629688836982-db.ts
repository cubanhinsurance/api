import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629688836982 implements MigrationInterface {
    name = 'db1629688836982'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ignored_issues_entity" ADD "reason" character varying NOT NULL DEFAULT 'ignored'`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "ignored_issues_entity" DROP COLUMN "reason"`);
    }

}
