import { MigrationInterface, QueryRunner } from 'typeorm';

export class db1625110868246 implements MigrationInterface {
  name = 'db1625110868246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE schema mod_bussines`);
    await queryRunner.query(`CREATE schema mod_clients`);
    await queryRunner.query(
      `CREATE TABLE "mod_enums"."licenses_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "config" jsonb NOT NULL DEFAULT '{}', "description" character varying, CONSTRAINT "PK_974c3697ee21c52a464f4c25c7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_bussines"."licenses" ("id" SERIAL NOT NULL, "active" boolean NOT NULL DEFAULT true, "expiration_date" TIMESTAMP, "config" jsonb NOT NULL DEFAULT '{}', "type" integer, CONSTRAINT "PK_1daf24a85e179f19ecd14c6c269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c59dd6cee725e3923ceeeae80" ON "mod_bussines"."licenses" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7421ebdcf3ebf384a36563b84b" ON "mod_bussines"."licenses" ("active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9723dac5f0d893b22d8b74ddbe" ON "mod_bussines"."licenses" ("expiration_date") `,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_bussines"."tech_applicant" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "description" character varying NOT NULL, "address" character varying NOT NULL, "ci" character varying NOT NULL, "response_date" TIMESTAMP NOT NULL, "approved" boolean, "confirmation_photo" character varying NOT NULL, "user" integer, "provinces" integer, "municipality" integer, "agent" integer, CONSTRAINT "PK_24af8383d8fbc47f222db8c49e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f5a7caefead5c07a1d89a7ba70" ON "mod_bussines"."tech_applicant" ("user") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a75b01cb413100624b0dd14ef" ON "mod_bussines"."tech_applicant" ("date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a9e2fad5f0a03256e0c069659" ON "mod_bussines"."tech_applicant" ("provinces") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b0e20281f07ac5db7178713a3" ON "mod_bussines"."tech_applicant" ("municipality") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_815b80e2a52da1c26ec10ab7f9" ON "mod_bussines"."tech_applicant" ("agent") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ed8949dad63649fd9f32121fa" ON "mod_bussines"."tech_applicant" ("response_date") `,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_enums"."coins" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "factor" integer NOT NULL DEFAULT '1', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_d9e243d58e1e3206ef37636a56b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_enums"."pay_gateways" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "config" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_c76e7993028b92276142aba7147" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_enums"."transactions_types" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_96fc5335092bcba3a66db857a14" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_bussines"."transactions" ("id" SERIAL NOT NULL, "amount" integer NOT NULL, "date" TIMESTAMP NOT NULL, "state" character varying NOT NULL, "description" character varying, "transaction_id" character varying NOT NULL, "from" integer, "to" integer, "type" integer, "coin" integer, "gateway" integer, CONSTRAINT "PK_66a3c88aaa0f716b7e9535c5d43" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_adbb3ca18b8fbbafec3ac48166" ON "mod_bussines"."transactions" ("from") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b41645d7b9fce92cf87643fff6" ON "mod_bussines"."transactions" ("to") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a17249f7dcf80d8a5ffe84a313" ON "mod_bussines"."transactions" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7af8fd458c16b2994af39e533" ON "mod_bussines"."transactions" ("coin") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_86b1d1508ccebb2fbcceefc101" ON "mod_bussines"."transactions" ("date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd62161b71e1a67e972f54bfb7" ON "mod_bussines"."transactions" ("state") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e2982d997cac37b86ca12bae97" ON "mod_bussines"."transactions" ("gateway") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a53a04dfaa780bb142f9cf86ee" ON "mod_bussines"."transactions" ("transaction_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_bussines"."user_licenses" ("id" SERIAL NOT NULL, "expiration" TIMESTAMP, "active" boolean NOT NULL, "renewed_date" TIMESTAMP, "type" integer, "user" integer, "transaction" integer, CONSTRAINT "PK_27dc7687c92318803f2017d856c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b3632805cc5072270e344633c" ON "mod_bussines"."user_licenses" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48903b614e60422233f90b1020" ON "mod_bussines"."user_licenses" ("user") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_54a07829f125dab5879cab1638" ON "mod_bussines"."user_licenses" ("expiration") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a51f518fce683cf56bb1591fdd" ON "mod_bussines"."user_licenses" ("transaction") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c973c619be4c325ba38b6c48e" ON "mod_bussines"."user_licenses" ("active") `,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_clients"."locations" ("id" SERIAL NOT NULL, "geom" geometry(Point,4326) NOT NULL, "address" character varying NOT NULL, "name" character varying NOT NULL, "provinces" integer, "municipality" integer, "user" integer, CONSTRAINT "PK_f61bff41515a56eaad233353e45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_870b4b24824679598a001501f6" ON "mod_clients"."locations" USING GiST ("geom") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3efb90e88ca30fbb6f8d92f12" ON "mod_clients"."locations" ("provinces") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fbc5b19614427e1a85d11b8369" ON "mod_clients"."locations" ("municipality") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a6fdafa8604cebf76b40b737bc" ON "mod_clients"."locations" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0a0f73f7f67ca42bdae9f9a116" ON "mod_clients"."locations" ("user") `,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_enums"."issues_states" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_ca88a0b642bf7570b5100561549" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mod_bussines"."tech_applicant_habilities_habilities" ("techApplicantId" integer NOT NULL, "habilitiesId" integer NOT NULL, CONSTRAINT "PK_0b615c41d169c4ed216d49acbb7" PRIMARY KEY ("techApplicantId", "habilitiesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d535917a2ea28fc43c63d64ad9" ON "mod_bussines"."tech_applicant_habilities_habilities" ("techApplicantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2cb0c43750bf28bc73a6a368f4" ON "mod_bussines"."tech_applicant_habilities_habilities" ("habilitiesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."licenses" ADD CONSTRAINT "FK_4c59dd6cee725e3923ceeeae80f" FOREIGN KEY ("type") REFERENCES "mod_enums"."licenses_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant" ADD CONSTRAINT "FK_f5a7caefead5c07a1d89a7ba705" FOREIGN KEY ("user") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant" ADD CONSTRAINT "FK_8a9e2fad5f0a03256e0c0696592" FOREIGN KEY ("provinces") REFERENCES "mod_enums"."provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant" ADD CONSTRAINT "FK_5b0e20281f07ac5db7178713a3f" FOREIGN KEY ("municipality") REFERENCES "mod_enums"."municipalities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant" ADD CONSTRAINT "FK_815b80e2a52da1c26ec10ab7f93" FOREIGN KEY ("agent") REFERENCES "mod_users"."agents"("user") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" ADD CONSTRAINT "FK_adbb3ca18b8fbbafec3ac481661" FOREIGN KEY ("from") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" ADD CONSTRAINT "FK_b41645d7b9fce92cf87643fff68" FOREIGN KEY ("to") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" ADD CONSTRAINT "FK_a17249f7dcf80d8a5ffe84a313f" FOREIGN KEY ("type") REFERENCES "mod_enums"."transactions_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" ADD CONSTRAINT "FK_f7af8fd458c16b2994af39e533f" FOREIGN KEY ("coin") REFERENCES "mod_enums"."coins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" ADD CONSTRAINT "FK_e2982d997cac37b86ca12bae976" FOREIGN KEY ("gateway") REFERENCES "mod_enums"."pay_gateways"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."user_licenses" ADD CONSTRAINT "FK_5b3632805cc5072270e344633c4" FOREIGN KEY ("type") REFERENCES "mod_bussines"."licenses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."user_licenses" ADD CONSTRAINT "FK_48903b614e60422233f90b10204" FOREIGN KEY ("user") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."user_licenses" ADD CONSTRAINT "FK_a51f518fce683cf56bb1591fdd3" FOREIGN KEY ("transaction") REFERENCES "mod_bussines"."transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_clients"."locations" ADD CONSTRAINT "FK_e3efb90e88ca30fbb6f8d92f12e" FOREIGN KEY ("provinces") REFERENCES "mod_enums"."provinces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_clients"."locations" ADD CONSTRAINT "FK_fbc5b19614427e1a85d11b8369a" FOREIGN KEY ("municipality") REFERENCES "mod_enums"."municipalities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_clients"."locations" ADD CONSTRAINT "FK_0a0f73f7f67ca42bdae9f9a1169" FOREIGN KEY ("user") REFERENCES "mod_users"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant_habilities_habilities" ADD CONSTRAINT "FK_d535917a2ea28fc43c63d64ad91" FOREIGN KEY ("techApplicantId") REFERENCES "mod_bussines"."tech_applicant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant_habilities_habilities" ADD CONSTRAINT "FK_2cb0c43750bf28bc73a6a368f48" FOREIGN KEY ("habilitiesId") REFERENCES "mod_enums"."habilities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant_habilities_habilities" DROP CONSTRAINT "FK_2cb0c43750bf28bc73a6a368f48"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant_habilities_habilities" DROP CONSTRAINT "FK_d535917a2ea28fc43c63d64ad91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_clients"."locations" DROP CONSTRAINT "FK_0a0f73f7f67ca42bdae9f9a1169"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_clients"."locations" DROP CONSTRAINT "FK_fbc5b19614427e1a85d11b8369a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_clients"."locations" DROP CONSTRAINT "FK_e3efb90e88ca30fbb6f8d92f12e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."user_licenses" DROP CONSTRAINT "FK_a51f518fce683cf56bb1591fdd3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."user_licenses" DROP CONSTRAINT "FK_48903b614e60422233f90b10204"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."user_licenses" DROP CONSTRAINT "FK_5b3632805cc5072270e344633c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" DROP CONSTRAINT "FK_e2982d997cac37b86ca12bae976"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" DROP CONSTRAINT "FK_f7af8fd458c16b2994af39e533f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" DROP CONSTRAINT "FK_a17249f7dcf80d8a5ffe84a313f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" DROP CONSTRAINT "FK_b41645d7b9fce92cf87643fff68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."transactions" DROP CONSTRAINT "FK_adbb3ca18b8fbbafec3ac481661"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant" DROP CONSTRAINT "FK_815b80e2a52da1c26ec10ab7f93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant" DROP CONSTRAINT "FK_5b0e20281f07ac5db7178713a3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant" DROP CONSTRAINT "FK_8a9e2fad5f0a03256e0c0696592"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."tech_applicant" DROP CONSTRAINT "FK_f5a7caefead5c07a1d89a7ba705"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mod_bussines"."licenses" DROP CONSTRAINT "FK_4c59dd6cee725e3923ceeeae80f"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_2cb0c43750bf28bc73a6a368f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_d535917a2ea28fc43c63d64ad9"`,
    );
    await queryRunner.query(
      `DROP TABLE "mod_bussines"."tech_applicant_habilities_habilities"`,
    );
    await queryRunner.query(`DROP TABLE "mod_enums"."issues_states"`);
    await queryRunner.query(
      `DROP INDEX "mod_clients"."IDX_0a0f73f7f67ca42bdae9f9a116"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_clients"."IDX_a6fdafa8604cebf76b40b737bc"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_clients"."IDX_fbc5b19614427e1a85d11b8369"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_clients"."IDX_e3efb90e88ca30fbb6f8d92f12"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_clients"."IDX_870b4b24824679598a001501f6"`,
    );
    await queryRunner.query(`DROP TABLE "mod_clients"."locations"`);
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_0c973c619be4c325ba38b6c48e"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_a51f518fce683cf56bb1591fdd"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_54a07829f125dab5879cab1638"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_48903b614e60422233f90b1020"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_5b3632805cc5072270e344633c"`,
    );
    await queryRunner.query(`DROP TABLE "mod_bussines"."user_licenses"`);
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_a53a04dfaa780bb142f9cf86ee"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_e2982d997cac37b86ca12bae97"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_fd62161b71e1a67e972f54bfb7"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_86b1d1508ccebb2fbcceefc101"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_f7af8fd458c16b2994af39e533"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_a17249f7dcf80d8a5ffe84a313"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_b41645d7b9fce92cf87643fff6"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_adbb3ca18b8fbbafec3ac48166"`,
    );
    await queryRunner.query(`DROP TABLE "mod_bussines"."transactions"`);
    await queryRunner.query(`DROP TABLE "mod_enums"."transactions_types"`);
    await queryRunner.query(`DROP TABLE "mod_enums"."pay_gateways"`);
    await queryRunner.query(`DROP TABLE "mod_enums"."coins"`);
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_5ed8949dad63649fd9f32121fa"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_815b80e2a52da1c26ec10ab7f9"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_5b0e20281f07ac5db7178713a3"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_8a9e2fad5f0a03256e0c069659"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_8a75b01cb413100624b0dd14ef"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_f5a7caefead5c07a1d89a7ba70"`,
    );
    await queryRunner.query(`DROP TABLE "mod_bussines"."tech_applicant"`);
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_9723dac5f0d893b22d8b74ddbe"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_7421ebdcf3ebf384a36563b84b"`,
    );
    await queryRunner.query(
      `DROP INDEX "mod_bussines"."IDX_4c59dd6cee725e3923ceeeae80"`,
    );
    await queryRunner.query(`DROP TABLE "mod_bussines"."licenses"`);
    await queryRunner.query(`DROP TABLE "mod_enums"."licenses_types"`);
  }
}
