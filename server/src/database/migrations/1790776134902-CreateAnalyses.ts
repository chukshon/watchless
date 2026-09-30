import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnalyses1790776134902 implements MigrationInterface {
    name = 'CreateAnalyses1790776134902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."analyses_sentiment_enum" AS ENUM('positive', 'negative', 'neutral')`);
        await queryRunner.query(`CREATE TABLE "analyses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "summary" text NOT NULL, "key_points" text array NOT NULL, "sentiment" "public"."analyses_sentiment_enum" NOT NULL DEFAULT 'neutral', "topics" text array NOT NULL, "suggested_tags" text array NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "video_id" uuid NOT NULL, CONSTRAINT "REL_9581fdf56db4d6700d8d0d52b5" UNIQUE ("video_id"), CONSTRAINT "PK_91421900ca225ed9865d016a940" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "analyses" ADD CONSTRAINT "FK_9581fdf56db4d6700d8d0d52b58" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "analyses" DROP CONSTRAINT "FK_9581fdf56db4d6700d8d0d52b58"`);
        await queryRunner.query(`DROP TABLE "analyses"`);
        await queryRunner.query(`DROP TYPE "public"."analyses_sentiment_enum"`);
    }

}
