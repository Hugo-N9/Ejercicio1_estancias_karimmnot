/*
  Warnings:

  - Added the required column `escolaridad` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "escolaridad" TEXT NOT NULL,
ALTER COLUMN "direccion" DROP NOT NULL;
