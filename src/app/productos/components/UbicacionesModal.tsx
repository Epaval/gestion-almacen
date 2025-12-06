 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UbicacionAsignada {
  ubicacion: {
    id: number;
    nombre: string;
    pasillo: number;
    lado: string;
    letra: string;
    nivel: number;
  };
  cantidad: number;
}

interface UbicacionesModalProps {
  productoId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function UbicacionesModal({ productoId, isOpen, onClose }: UbicacionesModalProps) {
  const [ubicaciones, setUbicaciones] = useState<UbicacionAsignada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productoNombre, setProductoNombre] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Solicitando ubicaciones para producto ID:', productoId);
        
        const response = await fetch(`/api/productos/${productoId}/ubicaciones`);
        
        console.log('📡 Estado de respuesta:', response.status);
        console.log('📡 URL solicitada:', `/api/productos/${productoId}/ubicaciones`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('📦 Datos recibidos:', data);
        console.log('📍 Ubicaciones encontradas:', data.ubicaciones?.length || 0);
        
        setUbicaciones(data.ubicaciones || []);
        
        // Obtener nombre del producto
        const productoResponse = await fetch(`/api/productos/${productoId}`);
        if (productoResponse.ok) {
          const productoData = await productoResponse.json();
          setProductoNombre(productoData.nombre || 'Producto');
        }
        
      } catch (err) {
        console.error('❌ Error al cargar ubicaciones:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setUbicaciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, productoId]);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setUbicaciones([]);
      setError(null);
      setProductoNombre('');
    }
  }, [isOpen]);

  const handleAsignarUbicacion = () => {
    // Cerrar el modal primero
    onClose();
    
    // Redirigir al mapa con el ID del producto como parámetro de consulta
    router.push(`/mapa?productoId=${productoId}&productoNombre=${encodeURIComponent(productoNombre)}`);
  };

  const handleVerEnMapa = (ubicacionId?: number) => {
    onClose();
    
    if (ubicacionId) {
      // Si hay una ubicación específica, ir a ella en el mapa
      router.push(`/mapa?ubicacionId=${ubicacionId}&productoId=${productoId}`);
    } else {
      // Ir al mapa general con el producto seleccionado
      router.push(`/mapa?productoId=${productoId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Ubicaciones del Producto
              </h3>
              {productoNombre && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">{productoNombre}</p>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                    ID: {productoId}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-4">
                <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-700 font-medium">Cargando ubicaciones...</p>
              <p className="text-sm text-gray-500 mt-2">Buscando en el sistema de almacén</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar</h4>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : ubicaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Sin ubicaciones asignadas</h4>
              <p className="text-gray-600 mb-4">
                Este producto no está asignado a ninguna ubicación en el almacén.
              </p>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mb-6">
                <p>💡 Haz clic en "Asignar ubicación" para seleccionar una ubicación en el mapa interactivo.</p>
              </div>
              <button
                onClick={handleAsignarUbicacion}
                className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Asignar ubicación en el mapa
              </button>
            </div>
          ) : (
            <>
              {/* Estadísticas rápidas */}
              <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total ubicaciones</p>
                    <p className="text-2xl font-bold text-gray-900">{ubicaciones.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stock total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {ubicaciones.reduce((sum, u) => sum + u.cantidad, 0)}
                    </p>
                  </div>
                  <button
                    onClick={handleAsignarUbicacion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + Agregar más
                  </button>
                </div>
              </div>

              {/* Lista de ubicaciones */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Ubicaciones asignadas ({ubicaciones.length})
                  </h4>
                  <button
                    onClick={() => handleVerEnMapa()}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Ver todas en el mapa
                  </button>
                </div>
                
                {ubicaciones.map((u, idx) => {
                  const nomenclatura = `${u.ubicacion.pasillo.toString().padStart(2, '0')}-${u.ubicacion.letra}-${u.ubicacion.nivel}`;
                  
                  return (
                    <div 
                      key={idx} 
                      className="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            u.ubicacion.lado === 'izquierdo' ? 'bg-blue-100' : 'bg-emerald-100'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              u.ubicacion.lado === 'izquierdo' ? 'text-blue-600' : 'text-emerald-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-gray-900">{u.ubicacion.nombre}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                                    {nomenclatura}
                                  </code>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    u.ubicacion.lado === 'izquierdo' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {u.ubicacion.lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleVerEnMapa(u.ubicacion.id)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver en mapa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-2xl font-bold text-gray-900">{u.cantidad}</span>
                          <span className="text-sm text-gray-500">unidades</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Pasillo</p>
                          <p className="font-semibold text-gray-900">P{u.ubicacion.pasillo.toString().padStart(2, '0')}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Rack</p>
                          <p className="font-semibold text-gray-900">{u.ubicacion.letra}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Nivel</p>
                          <p className="font-semibold text-gray-900">N{u.ubicacion.nivel}</p>
                        </div>
                      </div>
                      
                      {/* Acciones rápidas */}
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleVerEnMapa(u.ubicacion.id)}
                          className="text-xs px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Ver en mapa
                        </button>
                        <button
                          onClick={() => {
                            // Aquí podrías agregar funcionalidad para mover
                            console.log('Mover producto de ubicación:', u.ubicacion.id);
                          }}
                          className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Mover
                        </button>
                        <button
                          onClick={() => {
                            // Aquí podrías agregar funcionalidad para ajustar stock
                            console.log('Ajustar stock en ubicación:', u.ubicacion.id);
                          }}
                          className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Ajustar stock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {ubicaciones.length > 0 ? (
                <span>
                  Producto: <span className="font-semibold text-gray-900">{productoNombre}</span> • 
                  Stock total: <span className="font-semibold text-gray-900">
                    {ubicaciones.reduce((sum, u) => sum + u.cantidad, 0)} unidades
                  </span>
                </span>
              ) : (
                <span>
                  ID del producto: <span className="font-semibold text-gray-900">{productoId}</span>
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {ubicaciones.length > 0 && (
                <button
                  onClick={handleAsignarUbicacion}
                  className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                >
                  + Asignar otra ubicación
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}