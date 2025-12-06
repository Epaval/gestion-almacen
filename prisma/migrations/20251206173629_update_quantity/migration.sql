/*
  Warnings:

  - You are about to drop the column `cantidadTotal` on the `Producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "cantidadTotal",
ADD COLUMN     "cantidad" INTEGER NOT NULL DEFAULT 0;
