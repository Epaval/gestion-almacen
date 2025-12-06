// src/app/ubicaciones/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function UbicacionesPage() {
  const ubicaciones = await prisma.ubicacion.findMany({
    orderBy: [
      { pasillo: 'asc' },
      { lado: 'asc' },
      { letra: 'asc' },
      { nivel: 'asc' },
    ],
    take: 100, // Limitar para rendimiento
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ubicaciones del Almacén</h1>
        <Link
          href="/mapa"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Ver Mapa 2D
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {ubicaciones.map((u) => (
          <div
            key={u.id}
            className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm hover:shadow-md transition"
          >
            <div className="text-sm font-mono font-bold text-blue-700">{u.nombre}</div>
            <div className="text-xs text-gray-500 mt-1">
              Pasillo {u.pasillo}, {u.lado}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total: {ubicaciones.length} ubicaciones (de 750)
      </div>
    </div>
  );
}