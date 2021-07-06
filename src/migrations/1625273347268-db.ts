import {MigrationInterface, QueryRunner} from "typeorm";

export class db1625273347268 implements MigrationInterface {
    name = 'db1625273347268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mod_bussines"."issues" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "scheduled" boolean NOT NULL DEFAULT false, "scheduled_description" character varying, "init_date" TIMESTAMP, "end_date" TIMESTAMP, "description" character varying, "location" geometry(Point), "state" character varying NOT NULL DEFAULT 'created', "data" jsonb NOT NULL, "expiration_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "minium_cost" integer, "maxium_cost" integer, "type" integer, "user" integer, "tech" integer, CONSTRAINT "PK_3caca82870fe813e9cfc155eea9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a158e27fe74776e51267e23650" ON "mod_bussines"."issues" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_0b1bda377bee71ec7605727a9c" ON "mod_bussines"."issues" ("user") `);
        await queryRunner.query(`CREATE INDEX "IDX_848e015bfa14082522bb4f5a2c" ON "mod_bussines"."issues" ("date") `);
        await queryRunner.query(`CREATE INDEX "IDX_1c168b6913e288b99b911a87a4" ON "mod_bussines"."issues" ("init_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_3cbe30fa5fc8fab4fca28e5c0b" ON "mod_bussines"."issues" ("end_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_e3cab2563d0fafd9a8464d590c" ON "mod_bussines"."issues" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_f1e574bd7d25c12cd32f55833c" ON "mod_bussines"."issues" ("state") `);
        await queryRunner.query(`CREATE INDEX "IDX_107bc55205a1e0db6e525a296e" ON "mod_bussines"."issues" ("expiration_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_20103a43b1bddae22c4fd688da" ON "mod_bussines"."issues" ("tech") `);
        await queryRunner.query(`CREATE TABLE "mod_bussines"."issues_traces" ("id" SERIAL NOT NULL, "state" character varying NOT NULL DEFAULT 'created', "date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_b89d394fb76492ab9b17e29b41b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7a1c8168370d36109dbd5c5f85" ON "mod_bussines"."issues_traces" ("state") `);
        await queryRunner.query(`CREATE INDEX "IDX_6908e7ba6786ebdfd3da50601e" ON "mod_bussines"."issues_traces" ("date") `);
        await queryRunner.query(`CREATE TABLE "mod_bussines"."ratings" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "rating" integer NOT NULL, "description" character varying, "like" boolean NOT NULL DEFAULT true, "from" integer, "to" integer, CONSTRAINT "PK_1816fe253fdaee954b249da2095" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_380152ceb57450aa92b4230e8d" ON "mod_bussines"."ratings" ("from") `);
        await queryRunner.query(`CREATE INDEX "IDX_5422c574f67547319474d82a48" ON "mod_bussines"."ratings" ("to") `);
        await queryRunner.query(`CREATE INDEX "IDX_886e3f752197ff23c0cc69a2d5" ON "mod_bussines"."ratings" ("date") `);
        await queryRunner.query(`CREATE TABLE "mod_bussines"."issues_traces_issues_traces" ("issuesId" integer NOT NULL, "issuesTracesId" integer NOT NULL, CONSTRAINT "PK_155d8edae5413c57b1d8b732aca" PRIMARY KEY ("issuesId", "issuesTracesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_731ccb206d981ea83fc1931063" ON "mod_bussines"."issues_traces_issues_traces" ("issuesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6c6cf5bee97ba08332b070d0b3" ON "mod_bussines"."issues_traces_issues_traces" ("issuesTracesId") `);
        await queryRunner.query(`ALTER TABLE "mod_users"."users" ADD "confirmed" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "mod_users"."users" ADD "hotp" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "mod_users"."users" ADD "totp" character varying`);
        await queryRunner.query(`ALTER TABLE "mod_users"."users" ADD "enable_totp" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD CONSTRAINT "FK_a158e27fe74776e51267e23650b" FOREIGN KEY ("type") REFERENCES "mod_enums"."issues_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD CONSTRAINT "FK_0b1bda377bee71ec7605727a9c8" FOREIGN KEY ("user") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" ADD CONSTRAINT "FK_20103a43b1bddae22c4fd688da8" FOREIGN KEY ("tech") REFERENCES "mod_users"."techniccians"("user") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ratings" ADD CONSTRAINT "FK_380152ceb57450aa92b4230e8d7" FOREIGN KEY ("from") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ratings" ADD CONSTRAINT "FK_5422c574f67547319474d82a48e" FOREIGN KEY ("to") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_traces_issues_traces" ADD CONSTRAINT "FK_731ccb206d981ea83fc19310631" FOREIGN KEY ("issuesId") REFERENCES "mod_bussines"."issues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_traces_issues_traces" ADD CONSTRAINT "FK_6c6cf5bee97ba08332b070d0b3c" FOREIGN KEY ("issuesTracesId") REFERENCES "mod_bussines"."issues_traces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_traces_issues_traces" DROP CONSTRAINT "FK_6c6cf5bee97ba08332b070d0b3c"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues_traces_issues_traces" DROP CONSTRAINT "FK_731ccb206d981ea83fc19310631"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ratings" DROP CONSTRAINT "FK_5422c574f67547319474d82a48e"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."ratings" DROP CONSTRAINT "FK_380152ceb57450aa92b4230e8d7"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP CONSTRAINT "FK_20103a43b1bddae22c4fd688da8"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP CONSTRAINT "FK_0b1bda377bee71ec7605727a9c8"`);
        await queryRunner.query(`ALTER TABLE "mod_bussines"."issues" DROP CONSTRAINT "FK_a158e27fe74776e51267e23650b"`);
        await queryRunner.query(`ALTER TABLE "mod_users"."users" DROP COLUMN "enable_totp"`);
        await queryRunner.query(`ALTER TABLE "mod_users"."users" DROP COLUMN "totp"`);
        await queryRunner.query(`ALTER TABLE "mod_users"."users" DROP COLUMN "hotp"`);
        await queryRunner.query(`ALTER TABLE "mod_users"."users" DROP COLUMN "confirmed"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_6c6cf5bee97ba08332b070d0b3"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_731ccb206d981ea83fc1931063"`);
        await queryRunner.query(`DROP TABLE "mod_bussines"."issues_traces_issues_traces"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_886e3f752197ff23c0cc69a2d5"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_5422c574f67547319474d82a48"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_380152ceb57450aa92b4230e8d"`);
        await queryRunner.query(`DROP TABLE "mod_bussines"."ratings"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_6908e7ba6786ebdfd3da50601e"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_7a1c8168370d36109dbd5c5f85"`);
        await queryRunner.query(`DROP TABLE "mod_bussines"."issues_traces"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_20103a43b1bddae22c4fd688da"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_107bc55205a1e0db6e525a296e"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_f1e574bd7d25c12cd32f55833c"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_e3cab2563d0fafd9a8464d590c"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_3cbe30fa5fc8fab4fca28e5c0b"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_1c168b6913e288b99b911a87a4"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_848e015bfa14082522bb4f5a2c"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_0b1bda377bee71ec7605727a9c"`);
        await queryRunner.query(`DROP INDEX "mod_bussines"."IDX_a158e27fe74776e51267e23650"`);
        await queryRunner.query(`DROP TABLE "mod_bussines"."issues"`);
    }

}
