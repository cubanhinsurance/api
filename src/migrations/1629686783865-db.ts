import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629686783865 implements MigrationInterface {
    name = 'db1629686783865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ignored_issues_entity" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user" integer, "issue" integer, CONSTRAINT "PK_69ee75fc0d0d4c180f7d6916be1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b80855c70f6f9f41d8f8cf3408" ON "ignored_issues_entity" ("user") `);
        await queryRunner.query(`CREATE INDEX "IDX_91b9ee1ea4210ae49dc3ce3792" ON "ignored_issues_entity" ("issue") `);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "ignored_issues_entity" ADD CONSTRAINT "FK_b80855c70f6f9f41d8f8cf34083" FOREIGN KEY ("user") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ignored_issues_entity" ADD CONSTRAINT "FK_91b9ee1ea4210ae49dc3ce37925" FOREIGN KEY ("issue") REFERENCES "mod_bussines"."issues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ignored_issues_entity" DROP CONSTRAINT "FK_91b9ee1ea4210ae49dc3ce37925"`);
        await queryRunner.query(`ALTER TABLE "ignored_issues_entity" DROP CONSTRAINT "FK_b80855c70f6f9f41d8f8cf34083"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`DROP INDEX "IDX_91b9ee1ea4210ae49dc3ce3792"`);
        await queryRunner.query(`DROP INDEX "IDX_b80855c70f6f9f41d8f8cf3408"`);
        await queryRunner.query(`DROP TABLE "ignored_issues_entity"`);
    }

}
