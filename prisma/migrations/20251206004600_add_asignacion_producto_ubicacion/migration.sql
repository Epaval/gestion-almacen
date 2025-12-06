/*
  Warnings:

  - You are about to drop the column `cantidad` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacionId` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the `ubicaciones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_ubicacionId_fkey";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "cantidad",
DROP COLUMN "ubicacionId",
ADD COLUMN     "cantidadTotal" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "ubicaciones";

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" SERIAL NOT NULL,
    "pasillo" INTEGER NOT NULL,
    "lado" TEXT NOT NULL,
    "letra" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "coordenadaX" INTEGER NOT NULL,
    "coordenadaY" INTEGER NOT NULL,
    "ancho" INTEGER NOT NULL DEFAULT 60,
    "alto" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionProductoUbicacion" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "ubicacionId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AsignacionProductoUbicacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_nombre_key" ON "Ubicacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "AsignacionProductoUbicacion_productoId_ubicacionId_key" ON "AsignacionProductoUbicacion"("productoId", "ubicacionId");

-- AddForeignKey
ALTER TABLE "AsignacionProductoUbicacion" ADD CONSTRAINT "AsignacionProductoUbicacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionProductoUbicacion" ADD CONSTRAINT "AsignacionProductoUbicacion_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
