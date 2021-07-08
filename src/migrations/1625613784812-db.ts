import {MigrationInterface, QueryRunner} from "typeorm";

export class db1625613784812 implements MigrationInterface {
    name = 'db1625613784812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" ADD "price" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" ADD "time" integer NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "mod_bussines"."licenses"."time" IS 'Tiempo de duracion de la licencia'`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" ADD "coin" integer`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" ADD CONSTRAINT "FK_24dfa058ed75618895b2b6d5dac" FOREIGN KEY ("coin") REFERENCES "mod_enums"."coins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" DROP CONSTRAINT "FK_24dfa058ed75618895b2b6d5dac"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" DROP COLUMN "coin"`);
        await queryRunner.query(`COMMENT ON COLUMN "mod_bussines"."licenses"."time" IS 'Tiempo de duracion de la licencia'`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses" DROP COLUMN "price"`);
    }

}
