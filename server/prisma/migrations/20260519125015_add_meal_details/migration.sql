/*
  Warnings:

  - Added the required column `ingredients` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameExtend` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nutriFacts` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steps` to the `Meal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "ingredients" JSONB NOT NULL,
ADD COLUMN     "nameExtend" TEXT NOT NULL,
ADD COLUMN     "nutriFacts" JSONB NOT NULL,
ADD COLUMN     "steps" JSONB NOT NULL;
