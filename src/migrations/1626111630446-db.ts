import {MigrationInterface, QueryRunner} from "typeorm";

export class db1626111630446 implements MigrationInterface {
    name = 'db1626111630446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mod_bussines"."licenses_coins_coins" ("licensesId" integer NOT NULL, "coinsId" integer NOT NULL, CONSTRAINT "PK_d9d4dc21163a88bf5dd8e2e1854" PRIMARY KEY ("licensesId", "coinsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_80acc231f85eaecaf53b3effdd" ON "mod_bussines"."licenses_coins_coins" ("licensesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a505c24f438b0d7e3b4badad13" ON "mod_bussines"."licenses_coins_coins" ("coinsId") `);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses_coins_coins" ADD CONSTRAINT "FK_80acc231f85eaecaf53b3effddd" FOREIGN KEY ("licensesId") REFERENCES "mod_bussines"."licenses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses_coins_coins" ADD CONSTRAINT "FK_a505c24f438b0d7e3b4badad134" FOREIGN KEY ("coinsId") REFERENCES "mod_enums"."coins"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses_coins_coins" DROP CONSTRAINT "FK_a505c24f438b0d7e3b4badad134"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."licenses_coins_coins" DROP CONSTRAINT "FK_80acc231f85eaecaf53b3effddd"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_a505c24f438b0d7e3b4badad13"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_80acc231f85eaecaf53b3effdd"`);
        await queryRunner.query(`DROP TABLE "mod_bussines"."licenses_coins_coins"`);
    }

}
