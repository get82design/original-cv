-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organismeCertification" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Certification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Certification" ("id", "order", "organismeCertification", "profileId", "title") SELECT "id", "order", "organismeCertification", "profileId", "title" FROM "Certification";
DROP TABLE "Certification";
ALTER TABLE "new_Certification" RENAME TO "Certification";
CREATE TABLE "new_Expertise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Expertise_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Expertise" ("id", "level", "order", "profileId", "title") SELECT "id", "level", "order", "profileId", "title" FROM "Expertise";
DROP TABLE "Expertise";
ALTER TABLE "new_Expertise" RENAME TO "Expertise";
CREATE UNIQUE INDEX "Expertise_profileId_order_key" ON "Expertise"("profileId", "order");
CREATE TABLE "new_Formation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organismeFormation" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Formation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Formation" ("end", "id", "order", "organismeFormation", "profileId", "start", "title") SELECT "end", "id", "order", "organismeFormation", "profileId", "start", "title" FROM "Formation";
DROP TABLE "Formation";
ALTER TABLE "new_Formation" RENAME TO "Formation";
CREATE UNIQUE INDEX "Formation_profileId_order_key" ON "Formation"("profileId", "order");
CREATE TABLE "new_Price" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "domaine" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Price_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Price" ("domaine", "icon", "id", "order", "profileId", "title") SELECT "domaine", "icon", "id", "order", "profileId", "title" FROM "Price";
DROP TABLE "Price";
ALTER TABLE "new_Price" RENAME TO "Price";
CREATE TABLE "new_SocialMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socialNetwork" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SocialMedia_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SocialMedia" ("id", "order", "profileId", "socialNetwork", "username") SELECT "id", "order", "profileId", "socialNetwork", "username" FROM "SocialMedia";
DROP TABLE "SocialMedia";
ALTER TABLE "new_SocialMedia" RENAME TO "SocialMedia";
CREATE UNIQUE INDEX "SocialMedia_profileId_socialNetwork_key" ON "SocialMedia"("profileId", "socialNetwork");
CREATE UNIQUE INDEX "SocialMedia_profileId_order_key" ON "SocialMedia"("profileId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
