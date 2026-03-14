-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Passion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Passion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Passion" ("icon", "id", "order", "profileId", "title") SELECT "icon", "id", "order", "profileId", "title" FROM "Passion";
DROP TABLE "Passion";
ALTER TABLE "new_Passion" RENAME TO "Passion";
CREATE UNIQUE INDEX "Passion_profileId_title_key" ON "Passion"("profileId", "title");
CREATE UNIQUE INDEX "Passion_profileId_order_key" ON "Passion"("profileId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
