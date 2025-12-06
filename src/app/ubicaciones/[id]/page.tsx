 // src/app/ubicaciones/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Building, 
  Layers, 
  Hash,
  Plus,
  Save,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Edit
} from 'lucide-react';
import { QuitarProductoButton } from './components/QuitarProductoButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UbicacionDetallePage({ params }: Props) {
  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) return notFound();

  // Cargar ubicación con sus asignaciones
  const ubicacion = await prisma.ubicacion.findUnique({
    where: { id: idNum },
    include: {
      productos: {
        include: { producto: true },
        orderBy: { producto: { nombre: 'asc' } }
      },
    },
  });

  if (!ubicacion) return notFound();

  // Calcular estadísticas
  const stockAsignado = ubicacion.productos.reduce((sum, a) => sum + a.cantidad, 0);
  const capacidadUtilizada = Math.min(100, Math.round((stockAsignado / 50) * 100)); // Ejemplo: capacidad máxima 50

  // Productos que NO están asignados a esta ubicación (para asignar)
  const productosDisponibles = await prisma.producto.findMany({
    where: {
      id: {
        notIn: ubicacion.productos.map(a => a.productoId),
      },
      cantidad: { gt: 0 },
    },
    select: { 
      id: true, 
      nombre: true, 
      codigoBarras: true, 
      qrCode: true, 
      cantidad: true,
      descripcion: true 
    },
    orderBy: { nombre: 'asc' }
  });

  // ✅ Asignar producto a ubicación
  async function handleAsignar(formData: FormData) {
    'use server';
    const productoId = Number(formData.get('productoId'));
    const cantidad = Number(formData.get('cantidad')) || 1;

    if (isNaN(productoId) || cantidad <= 0) return;

    try {
      // Verificar stock total disponible
      const producto = await prisma.producto.findUnique({
        where: { id: productoId },
        select: { cantidad: true },
      });

      if (!producto || cantidad > producto.cantidad) {
        console.error('Cantidad excede el stock total');
        return;
      }

      await prisma.asignacionProductoUbicacion.create({
        data: {
          productoId,
          ubicacionId: idNum,
          cantidad,
        },
      });
    } catch (error) {
      console.error('Error al asignar:', error);
    }
  }

  // ✅ Actualizar cantidad en ubicación
  async function handleActualizarCantidad(formData: FormData) {
    'use server';
    const asignacionId = Number(formData.get('asignacionId'));
    const nuevaCantidad = Number(formData.get('cantidad'));

    if (isNaN(asignacionId) || nuevaCantidad <= 0) return;

    try {
      const asignacion = await prisma.asignacionProductoUbicacion.findUnique({
        where: { id: asignacionId },
        include: { producto: true },
      });

      if (!asignacion || nuevaCantidad > asignacion.producto.cantidad) {
        console.error('Cantidad excede el stock total');
        return;
      }

      await prisma.asignacionProductoUbicacion.update({
        where: { id: asignacionId },
        data: { cantidad: nuevaCantidad },
      });
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  }

  // ✅ Quitar producto de la ubicación
  async function handleQuitar(asignacionId: number) {
    'use server';
    try {
      await prisma.asignacionProductoUbicacion.delete({
        where: { id: asignacionId },
      });
    } catch (error) {
      console.error('Error al quitar producto:', error);
    }
  }

  const nomenclatura = `${ubicacion.pasillo.toString().padStart(2, '0')}-${ubicacion.letra}-${ubicacion.nivel}`;
  const ladoColor = ubicacion.lado === 'izquierdo' ? 'from-blue-500 to-blue-600' : 'from-emerald-500 to-green-600';
  const ladoText = ubicacion.lado === 'izquierdo' ? 'Lado Izquierdo' : 'Lado Derecho';

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/mapa" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-4 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al mapa interactivo
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 bg-linear-to-r ${ladoColor} rounded-2xl shadow-lg`}>
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{ubicacion.nombre}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      <Building className="w-4 h-4" />
                      Pasillo {ubicacion.pasillo.toString().padStart(2, '0')}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      ubicacion.lado === 'izquierdo' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <Layers className="w-4 h-4" />
                      {ladoText}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                      <Hash className="w-4 h-4" />
                      Nivel {ubicacion.nivel}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <code className="px-4 py-2 bg-gray-900 text-white rounded-lg text-lg font-mono font-bold tracking-wide">
                  {nomenclatura}
                </code>
                <span className="text-sm text-gray-500">
                  Código único de ubicación
                </span>
              </div>
            </div>
            
            {/* Estadísticas rápidas */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm min-w-[300px]">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Resumen de ubicación
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Productos asignados:</span>
                  <span className="font-bold text-gray-900">{ubicacion.productos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock total:</span>
                  <span className="text-xl font-bold text-emerald-700">{stockAsignado} unidades</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Capacidad utilizada</span>
                    <span>{capacidadUtilizada}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        capacidadUtilizada > 80 ? 'bg-red-500' : 
                        capacidadUtilizada > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capacidadUtilizada}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Productos asignados */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Productos en esta ubicación
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Gestiona el inventario asignado a {nomenclatura}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {ubicacion.productos.length} productos
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {ubicacion.productos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Ubicación vacía
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      No hay productos asignados a esta ubicación. 
                      Comienza asignando productos desde la sección de la derecha.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ubicacion.productos.map((a) => (
                      <div 
                        key={a.id} 
                        className="group border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 bg-linear-to-br from-blue-100 to-blue-200 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                  {a.producto.nombre}
                                </h4>
                                {a.producto.descripcion && (
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                    {a.producto.descripcion}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-2">
                                  {a.producto.codigoBarras && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      <span className="font-medium">Barras:</span> {a.producto.codigoBarras}
                                    </span>
                                  )}
                                  {a.producto.qrCode && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      <span className="font-medium">QR:</span> {a.producto.qrCode}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs">
                                    <span className="font-medium">Stock total:</span> {a.producto.cantidad}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:items-end gap-3">
                            <div className="flex items-center gap-2">
                              <form action={handleActualizarCantidad} className="flex items-center gap-2">
                                <input type="hidden" name="asignacionId" value={a.id} />
                                <div className="relative">
                                  <input
                                    type="number"
                                    name="cantidad"
                                    min="1"
                                    max={a.producto.cantidad}
                                    defaultValue={a.cantidad}
                                    className="w-24 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  />
                                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                <button
                                  type="submit"
                                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                  <Save className="w-4 h-4" />
                                  Guardar
                                </button>
                              </form>
                            </div>
                            
                            <QuitarProductoButton 
                              asignacionId={a.id}
                              onQuitar={handleQuitar}
                            />
                          </div>
                        </div>
                        
                        {/* Barra de progreso para cantidad asignada */}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Cantidad asignada vs stock total</span>
                            <span>{a.cantidad} / {a.producto.cantidad}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                a.cantidad > a.producto.cantidad * 0.8 ? 'bg-red-500' : 
                                a.cantidad > a.producto.cantidad * 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${(a.cantidad / a.producto.cantidad) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha: Asignar nuevo producto */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  Asignar nuevo producto
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Agrega productos a la ubicación {nomenclatura}
                </p>
              </div>

              <div className="p-6">
                {productosDisponibles.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                      <AlertCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-700 mb-2">
                      Sin productos disponibles
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Todos los productos con stock ya están asignados a esta ubicación.
                    </p>
                    <Link 
                      href="/productos" 
                      className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Ver todos los productos
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                ) : (
                  <form action={handleAsignar} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar producto
                      </label>
                      <div className="relative">
                        <select
                          name="productoId"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
                        >
                          <option value="">Selecciona un producto</option>
                          {productosDisponibles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} • Stock: {p.cantidad} unidades
                            </option>
                          ))}
                        </select>
                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad a asignar
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="cantidad"
                          min="1"
                          placeholder="Ej: 10"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Máximo disponible según stock total del producto
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Asignar a esta ubicación
                    </button>

                    {/* Productos disponibles */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Productos disponibles ({productosDisponibles.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {productosDisponibles.map((p) => (
                          <div 
                            key={p.id} 
                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="font-medium text-sm text-gray-900 mb-1">{p.nombre}</div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Stock:</span>
                              <span className="font-semibold text-emerald-700">{p.cantidad} unidades</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}