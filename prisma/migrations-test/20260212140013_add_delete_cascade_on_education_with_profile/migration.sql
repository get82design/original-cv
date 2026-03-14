-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "school" TEXT NOT NULL,
    "city" TEXT,
    "degree" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME,
    "obtained" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Education" ("city", "degree", "end", "id", "obtained", "order", "profileId", "school", "start", "title") SELECT "city", "degree", "end", "id", "obtained", "order", "profileId", "school", "start", "title" FROM "Education";
DROP TABLE "Education";
ALTER TABLE "new_Education" RENAME TO "Education";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
