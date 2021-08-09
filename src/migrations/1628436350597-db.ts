import {MigrationInterface, QueryRunner} from "typeorm";

export class db1628436350597 implements MigrationInterface {
    name = 'db1628436350597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD "clientLocationId" integer`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`CREATE INDEX "IDX_c65996ee30b34d62704eab6b2a" ON "mod_bussines"."issues" ("clientLocationId") `);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD CONSTRAINT "FK_c65996ee30b34d62704eab6b2a3" FOREIGN KEY ("clientLocationId") REFERENCES "mod_clients"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP CONSTRAINT "FK_c65996ee30b34d62704eab6b2a3"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_c65996ee30b34d62704eab6b2a"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP COLUMN "clientLocationId"`);
    }

}
