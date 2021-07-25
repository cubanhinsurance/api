import {MigrationInterface, QueryRunner} from "typeorm";

export class db1627092627366 implements MigrationInterface {
    name = 'db1627092627366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_enums"."licenses_types" ADD "features" jsonb`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_enums"."licenses_types" DROP COLUMN "features"`);
    }

}
