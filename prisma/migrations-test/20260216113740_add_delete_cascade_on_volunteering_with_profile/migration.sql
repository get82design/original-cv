-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Volunteering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "description" TEXT,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "location" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Volunteering_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Volunteering" ("description", "end", "id", "location", "order", "organisation", "profileId", "start", "title") SELECT "description", "end", "id", "location", "order", "organisation", "profileId", "start", "title" FROM "Volunteering";
DROP TABLE "Volunteering";
ALTER TABLE "new_Volunteering" RENAME TO "Volunteering";
CREATE UNIQUE INDEX "Volunteering_profileId_order_key" ON "Volunteering"("profileId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
