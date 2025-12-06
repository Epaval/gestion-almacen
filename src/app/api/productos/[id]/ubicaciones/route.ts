// src/app/api/productos/[id]/ubicaciones/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return notFound();
  }

  try {
    const asignaciones = await prisma.asignacionProductoUbicacion.findMany({
      where: { productoId: productId },
      include: {
        ubicacion: {
          select: {
            nombre: true,
            pasillo: true,
            lado: true,
            letra: true,
            nivel: true,
          },
        },
      },
    });

    const ubicaciones = asignaciones.map(a => ({
      ubicacion: a.ubicacion,
      cantidad: a.cantidad,
    }));

    return NextResponse.json({ ubicaciones });
  } catch (error) {
    console.error('Error al cargar ubicaciones:', error);
    return NextResponse.json({ error: 'Error al cargar ubicaciones' }, { status: 500 });
  }
}