import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptionTables1791365298270 implements MigrationInterface {
    name = 'CreateSubscriptionTables1791365298270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "duration" integer NOT NULL, "currency" character varying NOT NULL, "billingInterval" character varying NOT NULL, "stripePriceId" character varying NOT NULL, "videoLimit" integer NOT NULL DEFAULT '0', "minutesLimit" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_subscriptions_status_enum" AS ENUM('active', 'cancelled', 'past_due', 'unpaid', 'incomplete', 'trial')`);
        await queryRunner.query(`CREATE TABLE "user_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."user_subscriptions_status_enum" NOT NULL DEFAULT 'incomplete', "stripeCustomerId" character varying, "stripeSubscriptionId" character varying, "currentPeriodStartDate" TIMESTAMP WITH TIME ZONE, "currentPeriodEndDate" TIMESTAMP WITH TIME ZONE, "cancelAt" TIMESTAMP WITH TIME ZONE, "cancelledAt" TIMESTAMP WITH TIME ZONE, "videoUsed" integer NOT NULL DEFAULT '0', "minutesUsed" integer NOT NULL DEFAULT '0', "videoLimit" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, "subscription_plan_id" uuid, CONSTRAINT "PK_9e928b0954e51705ab44988812c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "stripe_customer_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_0641da02314913e28f6131310eb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_b6e02561ba40a3798a7e1432f2e" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_b6e02561ba40a3798a7e1432f2e"`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_0641da02314913e28f6131310eb"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stripe_customer_id"`);
        await queryRunner.query(`DROP TABLE "user_subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."user_subscriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
    }

}
