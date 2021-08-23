import {MigrationInterface, QueryRunner} from "typeorm";

export class db1629684743744 implements MigrationInterface {
    name = 'db1629684743744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP CONSTRAINT "FK_20103a43b1bddae22c4fd688da8"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(Point)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD CONSTRAINT "FK_20103a43b1bddae22c4fd688da8" FOREIGN KEY ("tech") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP CONSTRAINT "FK_20103a43b1bddae22c4fd688da8"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ALTER COLUMN "location" TYPE geometry(POINT,0)`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD CONSTRAINT "FK_20103a43b1bddae22c4fd688da8" FOREIGN KEY ("tech") REFERENCES "mod_users"."techniccians"("user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
