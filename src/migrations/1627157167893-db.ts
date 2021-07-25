import {MigrationInterface, QueryRunner} from "typeorm";

export class db1627157167893 implements MigrationInterface {
    name = 'db1627157167893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_enums"."licenses_types" ALTER COLUMN "features" SET DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_enums"."licenses_types" ALTER COLUMN "features" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
    }

}
