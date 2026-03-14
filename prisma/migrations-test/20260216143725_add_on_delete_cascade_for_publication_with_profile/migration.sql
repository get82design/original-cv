-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Publication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "journalName" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Publication_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Publication" ("description", "end", "id", "journalName", "order", "profileId", "start", "title", "url") SELECT "description", "end", "id", "journalName", "order", "profileId", "start", "title", "url" FROM "Publication";
DROP TABLE "Publication";
ALTER TABLE "new_Publication" RENAME TO "Publication";
CREATE UNIQUE INDEX "Publication_profileId_title_key" ON "Publication"("profileId", "title");
CREATE UNIQUE INDEX "Publication_profileId_order_key" ON "Publication"("profileId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
