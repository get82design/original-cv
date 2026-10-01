-- AlterTable: préférence UX — ne plus afficher le stepper 1ère utilisation
ALTER TABLE "User" ADD COLUMN "hideCvOnboarding" BOOLEAN NOT NULL DEFAULT false;
