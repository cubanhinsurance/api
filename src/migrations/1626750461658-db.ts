import {MigrationInterface, QueryRunner} from "typeorm";

export class db1626750461658 implements MigrationInterface {
    name = 'db1626750461658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_enums"."pay_gateways" ADD "avatar" character varying`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_enums"."pay_gateways" DROP COLUMN "avatar"`);
    }

}
