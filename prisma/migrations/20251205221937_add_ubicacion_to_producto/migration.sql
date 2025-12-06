/*
  Warnings:

  - You are about to drop the `_ProductoToUbicacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductoToUbicacion" DROP CONSTRAINT "_ProductoToUbicacion_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductoToUbicacion" DROP CONSTRAINT "_ProductoToUbicacion_B_fkey";

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "ubicacionId" INTEGER;

-- DropTable
DROP TABLE "_ProductoToUbicacion";

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
