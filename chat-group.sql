CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "space_type" AS ENUM (
  'public',
  'private'
);

CREATE TYPE "member_role" AS ENUM (
  'owner',
  'member'
);

CREATE TYPE "invitation_status" AS ENUM (
  'sended',
  'received',
  'accepted',
  'rejected',
  'expired',
  'cenceled'
);

CREATE TYPE "request_status" AS ENUM (
  'sended',
  'received',
  'accepted',
  'rejected',
  'canceled'
);

CREATE TABLE "users" (
  "id" uuid UNIQUE PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "name" varchar(30) NOT NULL,
  "state" varchar(255),
  "password" varchar(255) NOT NULL,
  "profile_picture_key" varchar(255),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "channels" (
  "id" uuid UNIQUE PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "name" varchar(30) NOT NULL,
  "space" space_type NOT NULL DEFAULT 'public',
  "description" varchar(255),
  "owner_id" uuid NOT NULL,
  "created_by" uuid NOT NULL,
  "updated_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "members" (
  "id" uuid UNIQUE PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "user_id" uuid NOT NULL,
  "role" member_role NOT NULL DEFAULT 'member',
  "channel_id" uuid NOT NULL,
  "invitation_status" invitation_status NOT NULL,
  "request_status" request_status NOT NULL,
  "deleted" boolean DEFAULT false,
  "expire_at" timestamptz,
  "created_by" uuid NOT NULL,
  "updated_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "messages" (
  "id" uuid UNIQUE PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "content" varchar(255) NOT NULL,
  "channel_id" uuid NOT NULL,
  "member_id" uuid NOT NULL,
  "message_id_to_reply" uuid,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

COMMENT ON COLUMN "channels"."space" IS 'Type of space';

COMMENT ON COLUMN "channels"."owner_id" IS 'Owner user id';

COMMENT ON COLUMN "members"."role" IS 'Type of member';

ALTER TABLE "channels" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id");

ALTER TABLE "members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "members" ADD FOREIGN KEY ("channel_id") REFERENCES "channels" ("id");

ALTER TABLE "messages" ADD FOREIGN KEY ("channel_id") REFERENCES "channels" ("id");

ALTER TABLE "messages" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("id");
