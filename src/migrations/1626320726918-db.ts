import {MigrationInterface, QueryRunner} from "typeorm";

export class db1626320726918 implements MigrationInterface {
    name = 'db1626320726918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_enums"."coins" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_enums"."coins" ADD CONSTRAINT "UQ_912c489b5341addd3cbaac20731" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_enums"."coins" DROP CONSTRAINT "UQ_912c489b5341addd3cbaac20731"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_enums"."coins" DROP COLUMN "deleted_at"`);
    }

}
