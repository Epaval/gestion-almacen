/*
  Warnings:

  - You are about to drop the column `cantidad` on the `Producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "cantidad",
ADD COLUMN     "cantidadTotal" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Historial" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "ubicacionAnterior" INTEGER,
    "ubicacionNueva" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Historial" ADD CONSTRAINT "Historial_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial" ADD CONSTRAINT "Historial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial" ADD CONSTRAINT "Historial_ubicacionAnterior_fkey" FOREIGN KEY ("ubicacionAnterior") REFERENCES "Ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial" ADD CONSTRAINT "Historial_ubicacionNueva_fkey" FOREIGN KEY ("ubicacionNueva") REFERENCES "Ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
