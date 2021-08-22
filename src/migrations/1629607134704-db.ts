import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629607134704 implements MigrationInterface {
    name = 'db1629607134704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP CONSTRAINT "FK_27e7c9ea09ad4d3e68d5d07dfc0"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD CONSTRAINT "FK_27e7c9ea09ad4d3e68d5d07dfc0" FOREIGN KEY ("tech") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" DROP CONSTRAINT "FK_27e7c9ea09ad4d3e68d5d07dfc0"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_applications" ADD CONSTRAINT "FK_27e7c9ea09ad4d3e68d5d07dfc0" FOREIGN KEY ("tech") REFERENCES "mod_users"."techniccians"("user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
