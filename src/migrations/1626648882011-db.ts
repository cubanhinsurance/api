import {MigrationInterface, QueryRunner} from "typeorm";

export class db1626648882011 implements MigrationInterface {
    name = 'db1626648882011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_enums"."licenses_types" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_enums"."licenses_types" DROP COLUMN "deleted_at"`);
    }

}
