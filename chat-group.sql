CREATE TYPE "space_type" AS ENUM (
  'public',
  'private'
);

CREATE TYPE "member_role" AS ENUM (
  'admin',
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

CREATE TABLE "users" (
  "id" int UNIQUE PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "state" varchar(255),
  "password" varchar(30) NOT NULL,
  "profile_picture_key" varchar(255),
  "created_at" timestamptz NOT NULL DEFAULT 'now()',
  "updated_at" timestamptz NOT NULL DEFAULT 'now()'
);

CREATE TABLE "channels" (
  "id" int UNIQUE PRIMARY KEY,
  "name" varchar(30) NOT NULL,
  "space" type_space NOT NULL DEFAULT 'public',
  "description" varchar(255),
  "created_at" timestamptz NOT NULL DEFAULT 'now()',
  "updated_at" timestamptz NOT NULL DEFAULT 'now()'
);

CREATE TABLE "members" (
  "id" int UNIQUE PRIMARY KEY,
  "user_id" int,
  "role" member_role NOT NULL DEFAULT 'member',
  "channel_id" int,
  "invitation_status" invitation_status NOT NULL,
  "deleted" boolean DEFAULT false,
  "expire_at" timestamptz NOT NULL,
  "created_by" int NOT NULL,
  "updated_by" int NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT 'now()',
  "updated_at" timestamptz NOT NULL DEFAULT 'now()'
);

CREATE TABLE "messages" (
  "id" int UNIQUE PRIMARY KEY,
  "content" varchar(255) NOT NULL,
  "channel_id" int,
  "member_id" int,
  "created_at" timestamptz NOT NULL DEFAULT 'now()'
);

COMMENT ON COLUMN "channels"."space" IS 'Type of space';

COMMENT ON COLUMN "members"."role" IS 'Type of member';

ALTER TABLE "members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "members" ADD FOREIGN KEY ("channel_id") REFERENCES "channels" ("id");

ALTER TABLE "messages" ADD FOREIGN KEY ("channel_id") REFERENCES "channels" ("id");

ALTER TABLE "messages" ADD FOREIGN KEY ("member_id") REFERENCES "members" ("id");
