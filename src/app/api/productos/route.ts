// src/app/api/productos/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const producto = await prisma.producto.create({
      data: {
        nombre: data.nombre,
        codigoBarras: data.codigoBarras || undefined,
        qrCode: data.qrCode || undefined,
        descripcion: data.descripcion || undefined,
        cantidad: data.cantidad || 0,
      },
    });
    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}