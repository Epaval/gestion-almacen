// src/app/api/productos/buscar/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get('codigo');

  if (!codigo) {
    return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
  }

  try {
    // Buscar por código de barras o QR
    const producto = await prisma.producto.findFirst({
      where: {
        OR: [
          { codigoBarras: { equals: codigo, mode: 'insensitive' } },
          { qrCode: { equals: codigo, mode: 'insensitive' } },
        ],
      },
      include: {
        ubicaciones: {
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
        },
      },
    });

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const ubicaciones = producto.ubicaciones.map(a => ({
      ubicacion: a.ubicacion,
      cantidad: a.cantidad,
    }));

    return NextResponse.json({
      producto: {
        id: producto.id,
        nombre: producto.nombre,
        codigoBarras: producto.codigoBarras,
        qrCode: producto.qrCode,
        cantidadTotal: producto.cantidad,
      },
      ubicaciones,
    });
  } catch (error) {
    console.error('Error al buscar producto:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}