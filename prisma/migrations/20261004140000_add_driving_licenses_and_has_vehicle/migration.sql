-- CreateEnum
CREATE TYPE "DrivingLicense" AS ENUM ('AM', 'A1', 'A2', 'A', 'B', 'B1', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE');

-- AlterTable
ALTER TABLE "CvHeader" ADD COLUMN "drivingLicenses" "DrivingLicense"[] DEFAULT ARRAY[]::"DrivingLicense"[],
ADD COLUMN "hasVehicle" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "drivingLicenses" "DrivingLicense"[] DEFAULT ARRAY[]::"DrivingLicense"[],
ADD COLUMN "hasVehicle" BOOLEAN NOT NULL DEFAULT false;
