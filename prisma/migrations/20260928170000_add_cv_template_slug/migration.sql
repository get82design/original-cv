-- AlterTable: slug SEO catalogue `/modeles/[slug]`
ALTER TABLE "CVTemplate" ADD COLUMN "slug" TEXT;

-- Backfill depuis le nom produit (ASCII lower)
UPDATE "CVTemplate"
SET "slug" = lower(regexp_replace(trim("name"), '[^a-zA-Z0-9]+', '-', 'g'));

UPDATE "CVTemplate"
SET "slug" = trim(both '-' from "slug");

-- Garde-fou si collision improbable
UPDATE "CVTemplate" t
SET "slug" = t."slug" || '-' || left(t."id", 6)
WHERE t."id" IN (
	SELECT a."id"
	FROM "CVTemplate" a
	INNER JOIN "CVTemplate" b ON a."slug" = b."slug" AND a."id" > b."id"
);

ALTER TABLE "CVTemplate" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "CVTemplate_slug_key" ON "CVTemplate"("slug");
