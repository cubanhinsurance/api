import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629607091788 implements MigrationInterface {
    name = 'db1629607091788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
    }

}
