 // src/lib/actions/moverStock.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function moverStockEntreUbicaciones(
  productoId: number,
  ubicacionOrigenId: number,
  ubicacionDestinoId: number,
  cantidad: number,
  usuarioId: number
) {
  // Validaciones iniciales
  if (cantidad <= 0) {
    return { error: 'La cantidad debe ser mayor a 0' };
  }

  if (ubicacionOrigenId === ubicacionDestinoId) {
    return { error: 'La ubicación de origen y destino no pueden ser la misma' };
  }

  try {
    // 🔄 Iniciar transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Verificar que el producto exista y tenga stock en la ubicación de origen
      const asignacionOrigen = await tx.asignacionProductoUbicacion.findUnique({
        where: {
          productoId_ubicacionId: {
            productoId,
            ubicacionId: ubicacionOrigenId,
          },
        },
      });

      if (!asignacionOrigen) {
        throw new Error('El producto no está asignado a la ubicación de origen');
      }

      if (asignacionOrigen.cantidad < cantidad) {
        throw new Error(`Stock insuficiente en la ubicación de origen. Disponible: ${asignacionOrigen.cantidad}`);
      }

      // 2. Verificar o crear asignación en la ubicación de destino
      const asignacionDestino = await tx.asignacionProductoUbicacion.findUnique({
        where: {
          productoId_ubicacionId: {
            productoId,
            ubicacionId: ubicacionDestinoId,
          },
        },
      });

      // 3. Actualizar stock en origen
      if (asignacionOrigen.cantidad === cantidad) {
        // Eliminar asignación si se mueve todo el stock
        await tx.asignacionProductoUbicacion.delete({
          where: { id: asignacionOrigen.id },
        });
      } else {
        // Reducir stock en origen
        await tx.asignacionProductoUbicacion.update({
          where: { id: asignacionOrigen.id },
          data: { cantidad: asignacionOrigen.cantidad - cantidad }, // ✅
        });
      }

      // 4. Actualizar stock en destino
      if (asignacionDestino) {
        await tx.asignacionProductoUbicacion.update({
          where: { id: asignacionDestino.id },
          data: { cantidad: asignacionDestino.cantidad + cantidad }, // ✅
        });
      } else {
        await tx.asignacionProductoUbicacion.create({
          data: { // ✅
            productoId,
            ubicacionId: ubicacionDestinoId,
            cantidad,
          },
        });
      }

      // 5. Registrar en historial
      await tx.historial.create({
        data: { // ✅
          productoId,
          accion: 'MOVIMIENTO',
          cantidad,
          ubicacionAnterior: ubicacionOrigenId,
          ubicacionNueva: ubicacionDestinoId,
          usuarioId,
          fecha: new Date(),
        },
      });

      return { success: true };
    });

    // ✅ Invalidar cache (usar rutas reales o '*')
    revalidatePath('/ubicaciones');
    revalidatePath('/productos');

    return resultado;
  } catch (error: any) {
    console.error('Error al mover stock:', error);
    return { error: error.message || 'Error al mover el stock' };
  }
}