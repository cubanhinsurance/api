import {MigrationInterface, QueryRunner} from "typeorm";

export class db1628887322178 implements MigrationInterface {
    name = 'db1628887322178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD "max_techs" integer`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD "max_distance" integer`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP COLUMN "max_distance"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP COLUMN "max_techs"`);
    }

}
