-- CreateTable
CREATE TABLE "ubicaciones" (
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

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductoToUbicacion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductoToUbicacion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_nombre_key" ON "ubicaciones"("nombre");

-- CreateIndex
CREATE INDEX "_ProductoToUbicacion_B_index" ON "_ProductoToUbicacion"("B");

-- AddForeignKey
ALTER TABLE "_ProductoToUbicacion" ADD CONSTRAINT "_ProductoToUbicacion_A_fkey" FOREIGN KEY ("A") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductoToUbicacion" ADD CONSTRAINT "_ProductoToUbicacion_B_fkey" FOREIGN KEY ("B") REFERENCES "ubicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
