// src/app/api/productos/list/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const where = search
      ? { nombre: { contains: search, mode: 'insensitive' } }
      : {};

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
      }),
      prisma.producto.count({ where }),
    ]);

    return NextResponse.json({
      productos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al cargar productos' }, { status: 500 });
  }
}