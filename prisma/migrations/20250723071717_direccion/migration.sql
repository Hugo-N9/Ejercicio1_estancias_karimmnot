/*
  Warnings:

  - You are about to drop the column `lat` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "lat",
DROP COLUMN "lng";
