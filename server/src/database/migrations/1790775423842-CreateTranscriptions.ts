import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTranscriptions1790775423842 implements MigrationInterface {
    name = 'CreateTranscriptions1790775423842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transcriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" text NOT NULL, "confidence" double precision NOT NULL, "is_music" boolean NOT NULL DEFAULT false, "audio_path" character varying(500) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "videoId" uuid NOT NULL, CONSTRAINT "REL_88c69a59ceec633946cd3e63e8" UNIQUE ("videoId"), CONSTRAINT "PK_cba8a0264bdf2680c0d93fc7d17" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transcriptions" ADD CONSTRAINT "FK_88c69a59ceec633946cd3e63e82" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transcriptions" DROP CONSTRAINT "FK_88c69a59ceec633946cd3e63e82"`);
        await queryRunner.query(`DROP TABLE "transcriptions"`);
    }

}
