import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629953696656 implements MigrationInterface {
    name = 'db1629953696656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mod_bussines"."ignored_applications" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "reason" character varying NOT NULL DEFAULT 'ignored', "description" character varying, "user" integer, "issue" integer, CONSTRAINT "PK_c63c89cd8108f2d1b84bf6b799f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6e0be15a0378204922640b7562" ON "mod_bussines"."ignored_applications" ("user") `);
        await queryRunner.query(`CREATE INDEX "IDX_66edadce4c062679f3f3ab03da" ON "mod_bussines"."ignored_applications" ("issue") `);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ignored_applications" ADD CONSTRAINT "FK_6e0be15a0378204922640b75621" FOREIGN KEY ("user") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ignored_applications" ADD CONSTRAINT "FK_66edadce4c062679f3f3ab03dab" FOREIGN KEY ("issue") REFERENCES "mod_bussines"."issues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ignored_applications" DROP CONSTRAINT "FK_66edadce4c062679f3f3ab03dab"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ignored_applications" DROP CONSTRAINT "FK_6e0be15a0378204922640b75621"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_66edadce4c062679f3f3ab03da"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_6e0be15a0378204922640b7562"`);
        await queryRunner.query(`DROP TABLE "mod_bussines"."ignored_applications"`);
    }

}
