 // src/app/mapa/page.tsx
import { prisma } from '@/lib/prisma';
import { InteractiveMap } from './components/InteractiveMap';

export default async function MapaAlmacenPage() {
  // Cargar ubicaciones con productos para determinar estado
  const ubicaciones = await prisma.ubicacion.findMany({
    select: {
      id: true,
      nombre: true,
      pasillo: true,
      lado: true,
      letra: true,
      nivel: true,
      // Contar productos asignados
      productos: {
        select: { id: true },
        take: 1, // Solo necesitamos saber si hay al menos uno
      },
    },
    orderBy: [
      { pasillo: 'asc' },
      { lado: 'asc' },
      { letra: 'asc' },
      { nivel: 'asc' },
    ],
  });

  // Transformar a formato esperado por el mapa
  const ubicacionesConEstado = ubicaciones.map(u => ({
    ...u,
    tieneProductos: u.productos.length > 0,
  }));

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mapa del Almacén</h1>
        <p className="text-gray-600 mt-1">
          {`15 pasillos • Lado izquierdo (A–E) • Lado derecho (F–J) • 5 niveles cada uno`}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          <span className="inline-block w-3 h-3 bg-orange-500 rounded mr-1"></span>
          = Ubicación con productos
        </p>
      </div>

      <InteractiveMap ubicaciones={ubicacionesConEstado} />
    </div>
  );
}