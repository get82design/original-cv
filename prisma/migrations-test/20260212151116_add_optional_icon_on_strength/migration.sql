-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Strength" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "profileId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Strength_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Strength" ("icon", "id", "order", "profileId", "title") SELECT "icon", "id", "order", "profileId", "title" FROM "Strength";
DROP TABLE "Strength";
ALTER TABLE "new_Strength" RENAME TO "Strength";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
