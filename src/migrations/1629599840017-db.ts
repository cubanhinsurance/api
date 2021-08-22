import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629599840017 implements MigrationInterface {
    name = 'db1629599840017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mod_bussines"."issues_applications" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "state" character varying NOT NULL DEFAULT 'pendent', "tech" integer, "issue" integer, CONSTRAINT "PK_16e0a0f1e3a621a0f77b8f32e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_27e7c9ea09ad4d3e68d5d07dfc" ON "mod_bussines"."issues_applications" ("tech") `);
        await queryRunner.query(`CREATE INDEX "IDX_b88a22634935e9eb2c940b2604" ON "mod_bussines"."issues_applications" ("issue") `);
        await queryRunner.query(`CREATE INDEX "IDX_544a037bd513d3c0af45ac2caa" ON "mod_bussines"."issues_applications" ("state") `);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD CONSTRAINT "FK_27e7c9ea09ad4d3e68d5d07dfc0" FOREIGN KEY ("tech") REFERENCES "mod_users"."techniccians"("user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD CONSTRAINT "FK_b88a22634935e9eb2c940b26044" FOREIGN KEY ("issue") REFERENCES "mod_bussines"."issues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP CONSTRAINT "FK_b88a22634935e9eb2c940b26044"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP CONSTRAINT "FK_27e7c9ea09ad4d3e68d5d07dfc0"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_544a037bd513d3c0af45ac2caa"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_b88a22634935e9eb2c940b2604"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_27e7c9ea09ad4d3e68d5d07dfc"`);
        await queryRunner.query(`DROP TABLE "mod_bussines"."issues_applications"`);
    }

}
