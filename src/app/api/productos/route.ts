 // src/app/api/productos/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

 async function generarCodigoUnico(): Promise<string> {
  let codigo: string;
  let existe = true;

  do {
     
    codigo = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    
    // Verificar si ya existe
    const producto = await prisma.producto.findUnique({
      where: { codigoBarras: codigo },
    });
    existe = producto !== null;
  } while (existe);

  return codigo;  
}
 

export async function POST(request: Request) {
  try {
    const data = await request.json();

   
    const codigoBarras = data.codigoBarras
      ? data.codigoBarras.trim() || undefined
      : await generarCodigoUnico();

    const producto = await prisma.producto.create({
       data:{
        nombre: data.nombre,
        codigoBarras, 
        qrCode: data.qrCode?.trim() || undefined,
        descripcion: data.descripcion?.trim() || undefined,
        cantidadTotal: data.cantidad || 0,
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}