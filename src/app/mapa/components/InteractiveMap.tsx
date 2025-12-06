 'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Package, 
  Layout, 
  ChevronRight, 
  Zap,
  Info,
  Grid,
  Maximize2,
  Search,
  Filter,
  Building,
  Warehouse
} from 'lucide-react';

interface Ubicacion {
  id: number;
  nombre: string;
  pasillo: number;
  lado: string;
  letra: string;
  nivel: number;
  tieneProductos: boolean;
  productosCount?: number;
}

interface InteractiveMapProps {
  ubicaciones: Ubicacion[];
}

export function InteractiveMap({ ubicaciones }: InteractiveMapProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPasillo, setSelectedPasillo] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLegend, setShowLegend] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Solución para el error de hidratación
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUbicacionClick = (ubicacionId: number) => {
    router.push(`/ubicaciones/${ubicacionId}`);
  };

  const pasillos = Array.from({ length: 15 }, (_, i) => i + 1);
  const letrasIzq = ['A', 'B', 'C', 'D', 'E'];
  const letrasDer = ['F', 'G', 'H', 'I', 'J'];
  const niveles = 5;

  // Generar nomenclatura de ubicación
  const getNomenclatura = (pasillo: number, letra: string, nivel: number, lado: string) => {
    const pasilloStr = pasillo.toString().padStart(2, '0');
    return `${pasilloStr}-${letra}-${nivel}`;
  };

  // Filtrar ubicaciones si hay búsqueda
  const filteredUbicaciones = searchTerm
    ? ubicaciones.filter(u => 
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.letra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.pasillo.toString().includes(searchTerm) ||
        getNomenclatura(u.pasillo, u.letra, u.nivel, u.lado).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : ubicaciones;

  // Agrupar ubicaciones
  const ubicacionesPorPasillo: Record<number, { izq: Ubicacion[]; der: Ubicacion[] }> = {};
  pasillos.forEach(p => {
    ubicacionesPorPasillo[p] = { izq: [], der: [] };
  });
  filteredUbicaciones.forEach(u => {
    if (u.lado === 'izquierdo') {
      ubicacionesPorPasillo[u.pasillo].izq.push(u);
    } else {
      ubicacionesPorPasillo[u.pasillo].der.push(u);
    }
  });

  // Componente de leyenda
  const Legend = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Layout className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-800">Leyenda del Mapa</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded shadow-sm"></div>
          <span className="text-xs text-gray-700">Ubicación disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded shadow-sm"></div>
          <span className="text-xs text-gray-700">Con productos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded shadow-sm"></div>
          <span className="text-xs text-gray-700">Sin asignar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded shadow-sm"></div>
          <span className="text-xs text-gray-700">Lado derecho</span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Nomenclatura:</h4>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Formato:</span>
            <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">01-A-1</code>
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Pasillo-Rack-Nivel</span> (Ej: 10-C-3)
          </div>
        </div>
      </div>
    </div>
  );

  // No renderizar nada en el servidor para evitar el mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Vista móvil optimizada
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mapa del Almacén</h1>
              <p className="text-sm text-gray-600">Visualiza y navega por las ubicaciones</p>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código (ej: 01-A-1)..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                onClick={() => setShowLegend(!showLegend)}
              >
                <Info className="w-4 h-4" />
                Leyenda
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
            </div>
          </div>

          {showLegend && <div className="mb-4"><Legend /></div>}
        </div>

        {/* Mapa móvil */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Pasillos ({pasillos.length})</h2>
            <span className="text-sm text-gray-500">
              {filteredUbicaciones.length} ubicaciones
            </span>
          </div>

          {pasillos.map(pasillo => (
            <div 
              key={pasillo} 
              className={`border-2 rounded-2xl p-4 bg-white shadow-sm transition-all duration-200 ${
                selectedPasillo === pasillo 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedPasillo(selectedPasillo === pasillo ? null : pasillo)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Pasillo {pasillo.toString().padStart(2, '0')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {ubicacionesPorPasillo[pasillo].izq.length + ubicacionesPorPasillo[pasillo].der.length} ubicaciones
                  </span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    selectedPasillo === pasillo ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {(selectedPasillo === pasillo || selectedPasillo === null) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Lado izquierdo */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="text-xs font-semibold text-blue-700">Lado A-E</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {letrasIzq.map(letra =>
                        Array.from({ length: niveles }, (_, nivelIdx) => {
                          const u = ubicacionesPorPasillo[pasillo].izq.find(
                            x => x.letra === letra && x.nivel === nivelIdx + 1
                          );
                          const nivel = nivelIdx + 1;
                          const codigo = getNomenclatura(pasillo, letra, nivel, 'izquierdo');
                          
                          return (
                            <button
                              key={`${letra}-${nivel}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (u) handleUbicacionClick(u.id);
                              }}
                              className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
                                u
                                  ? u.tieneProductos
                                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 border border-orange-200 hover:shadow-md'
                                    : 'bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 hover:shadow-md'
                                  : 'bg-gray-100 border border-gray-200'
                              }`}
                              disabled={!u}
                              title={u ? `${u.nombre} - ${codigo}${u.tieneProductos ? ' (Con productos)' : ' (Disponible)'}` : undefined}
                            >
                              <span className={`text-[10px] font-bold leading-tight ${
                                u
                                  ? u.tieneProductos 
                                    ? 'text-orange-800'
                                    : 'text-blue-800'
                                  : 'text-gray-400'
                              }`}>
                                {codigo}
                              </span>
                              {u?.tieneProductos && (
                                <Package className="w-2 h-2 mt-0.5 text-orange-600" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Lado derecho */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <h4 className="text-xs font-semibold text-emerald-700">Lado F-J</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {letrasDer.map(letra =>
                        Array.from({ length: niveles }, (_, nivelIdx) => {
                          const u = ubicacionesPorPasillo[pasillo].der.find(
                            x => x.letra === letra && x.nivel === nivelIdx + 1
                          );
                          const nivel = nivelIdx + 1;
                          const codigo = getNomenclatura(pasillo, letra, nivel, 'derecho');
                          
                          return (
                            <button
                              key={`${letra}-${nivel}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (u) handleUbicacionClick(u.id);
                              }}
                              className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
                                u
                                  ? u.tieneProductos
                                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 border border-orange-200 hover:shadow-md'
                                    : 'bg-gradient-to-br from-emerald-100 to-green-200 border border-emerald-200 hover:shadow-md'
                                  : 'bg-gray-100 border border-gray-200'
                              }`}
                              disabled={!u}
                              title={u ? `${u.nombre} - ${codigo}${u.tieneProductos ? ' (Con productos)' : ' (Disponible)'}` : undefined}
                            >
                              <span className={`text-[10px] font-bold leading-tight ${
                                u
                                  ? u.tieneProductos 
                                    ? 'text-orange-800'
                                    : 'text-emerald-800'
                                  : 'text-gray-400'
                              }`}>
                                {codigo}
                              </span>
                              {u?.tieneProductos && (
                                <Package className="w-2 h-2 mt-0.5 text-orange-600" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ MODO ESCRITORIO: SVG mejorado
  const anchoColumna = 50; // Aumentado para mostrar el código completo
  const separacionEntreLados = 120;
  const anchoPorPasillo = anchoColumna * 2 + separacionEntreLados + 30;
  const alturaPorNivel = 16;
  const alturaPorLetra = niveles * alturaPorNivel + 20;
  const alturaTotal = 80 + 5 * alturaPorLetra + 50;
  const anchoTotal = pasillos.length * anchoPorPasillo + 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Warehouse className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mapa Interactivo del Almacén</h1>
                <p className="text-gray-600 mt-1">
                  Sistema de ubicación: Pasillo-Rack-Nivel (Ej: 01-A-1, 10-C-3)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Maximize2 className="w-4 h-4" />
                <span className="text-sm font-medium">Pantalla completa</span>
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                onClick={() => setShowLegend(!showLegend)}
              >
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">Leyenda</span>
              </button>
            </div>
          </div>

          {/* Barra de control */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código (ej: 01-A-1, 10-C-3)..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Grid className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    {filteredUbicaciones.length} ubicaciones
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-700">
                    {filteredUbicaciones.filter(u => u.tieneProductos).length} ocupadas
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <div className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
                  Formato: Pasillo-Rack-Nivel
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {showLegend && (
              <div className="lg:col-span-1">
                <Legend />
                {/* Estadísticas */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Resumen</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Total ubicaciones:</span>
                      <span className="font-semibold">{ubicaciones.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Ubicaciones ocupadas:</span>
                      <span className="font-semibold text-amber-600">
                        {ubicaciones.filter(u => u.tieneProductos).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Disponibles:</span>
                      <span className="font-semibold text-blue-600">
                        {ubicaciones.filter(u => !u.tieneProductos).length}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Ejemplos:</span>
                        <div className="mt-1 space-y-1">
                          <code className="block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">01-A-1</code>
                          <code className="block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">10-C-3</code>
                          <code className="block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">15-J-5</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`${showLegend ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              {/* Mapa SVG */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
                <div className="overflow-x-auto pb-4">
                  <svg
                    width={anchoTotal}
                    height={alturaTotal}
                    className="block min-w-full"
                    style={{ minWidth: `${anchoTotal}px` }}
                  >
                    {/* Fondo con degradado */}
                    <defs>
                      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#f1f5f9" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width={anchoTotal} height={alturaTotal} fill="url(#bgGradient)" />

                    {/* Líneas de separación */}
                    {pasillos.map((pasillo, index) => {
                      const x = index * anchoPorPasillo + 50;
                      if (index > 0) {
                        return (
                          <line
                            key={`sep-${pasillo}`}
                            x1={x}
                            y1="40"
                            x2={x}
                            y2={alturaTotal - 20}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                          />
                        );
                      }
                      return null;
                    })}

                    {pasillos.map((pasillo) => {
                      const x = (pasillo - 1) * anchoPorPasillo + 50;
                      const yBase = 60;

                      return (
                        <g key={pasillo}>
                          {/* Header del pasillo */}
                          <g>
                            <rect
                              x={x - 10}
                              y="20"
                              width={anchoPorPasillo - 20}
                              height="30"
                              rx="8"
                              fill="white"
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                            <text
                              x={x + (anchoPorPasillo - 20) / 2}
                              y="42"
                              textAnchor="middle"
                              fontSize="14"
                              fontWeight="bold"
                              fill="#1f2937"
                            >
                              Pasillo {pasillo.toString().padStart(2, '0')}
                            </text>
                            <text
                              x={x + (anchoPorPasillo - 20) / 2}
                              y="58"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#6b7280"
                            >
                              {ubicacionesPorPasillo[pasillo].izq.length + ubicacionesPorPasillo[pasillo].der.length} ubicaciones
                            </text>
                          </g>

                          {/* Lado izquierdo - A-E */}
                          {letrasIzq.map((letra, letraIdx) => {
                            return Array.from({ length: niveles }, (_, nivelIdx) => {
                              const u = ubicacionesPorPasillo[pasillo].izq.find(
                                x => x.letra === letra && x.nivel === nivelIdx + 1
                              );
                              const y = yBase + letraIdx * alturaPorLetra + nivelIdx * alturaPorNivel;
                              const nivel = nivelIdx + 1;
                              const codigo = `${pasillo.toString().padStart(2, '0')}-${letra}-${nivel}`;

                              return (
                                <g key={`${pasillo}-izq-${letra}-${nivel}`}>
                                  {/* Sombra */}
                                  <rect
                                    x={x + 1}
                                    y={y + 1}
                                    width={anchoColumna}
                                    height={12}
                                    rx="4"
                                    fill="rgba(0,0,0,0.1)"
                                    opacity="0.2"
                                  />
                                  
                                  {/* Ubicación */}
                                  <rect
                                    x={x}
                                    y={y}
                                    width={anchoColumna}
                                    height={12}
                                    rx="4"
                                    fill={u 
                                      ? u.tieneProductos 
                                        ? 'url(#occupiedGradient)' 
                                        : 'url(#availableGradient)'
                                      : '#f3f4f6'
                                    }
                                    stroke={u ? (u.tieneProductos ? '#f97316' : '#3b82f6') : '#d1d5db'}
                                    strokeWidth={u ? '1.5' : '1'}
                                    className="cursor-pointer hover:scale-105 transition-transform duration-150"
                                    pointerEvents="all"
                                    onClick={u ? () => handleUbicacionClick(u.id) : undefined}
                                    data-title={u ? `${u.nombre} - ${codigo}${u.tieneProductos ? ' (Con productos)' : ' (Disponible)'}` : ''}
                                  />
                                  
                                  {/* Código de ubicación */}
                                  <text
                                    x={x + anchoColumna / 2}
                                    y={y + 8}
                                    textAnchor="middle"
                                    fontSize="6"
                                    fontWeight="bold"
                                    fill={u ? (u.tieneProductos ? 'white' : 'white') : '#9ca3af'}
                                  >
                                    {codigo}
                                  </text>
                                </g>
                              );
                            });
                          })}

                          {/* Lado derecho - F-J */}
                          {letrasDer.map((letra, letraIdx) => {
                            return Array.from({ length: niveles }, (_, nivelIdx) => {
                              const u = ubicacionesPorPasillo[pasillo].der.find(
                                x => x.letra === letra && x.nivel === nivelIdx + 1
                              );
                              const y = yBase + letraIdx * alturaPorLetra + nivelIdx * alturaPorNivel;
                              const nivel = nivelIdx + 1;
                              const codigo = `${pasillo.toString().padStart(2, '0')}-${letra}-${nivel}`;

                              return (
                                <g key={`${pasillo}-der-${letra}-${nivel}`}>
                                  {/* Sombra */}
                                  <rect
                                    x={x + anchoColumna + separacionEntreLados + 1}
                                    y={y + 1}
                                    width={anchoColumna}
                                    height={12}
                                    rx="4"
                                    fill="rgba(0,0,0,0.1)"
                                    opacity="0.2"
                                  />
                                  
                                  {/* Ubicación */}
                                  <rect
                                    x={x + anchoColumna + separacionEntreLados}
                                    y={y}
                                    width={anchoColumna}
                                    height={12}
                                    rx="4"
                                    fill={u 
                                      ? u.tieneProductos 
                                        ? 'url(#occupiedGradient)' 
                                        : 'url(#rightAvailableGradient)'
                                      : '#f3f4f6'
                                    }
                                    stroke={u ? (u.tieneProductos ? '#f97316' : '#10b981') : '#d1d5db'}
                                    strokeWidth={u ? '1.5' : '1'}
                                    className="cursor-pointer hover:scale-105 transition-transform duration-150"
                                    pointerEvents="all"
                                    onClick={u ? () => handleUbicacionClick(u.id) : undefined}
                                    data-title={u ? `${u.nombre} - ${codigo}${u.tieneProductos ? ' (Con productos)' : ' (Disponible)'}` : ''}
                                  />
                                  
                                  {/* Código de ubicación */}
                                  <text
                                    x={x + anchoColumna + separacionEntreLados + anchoColumna / 2}
                                    y={y + 8}
                                    textAnchor="middle"
                                    fontSize="6"
                                    fontWeight="bold"
                                    fill={u ? (u.tieneProductos ? 'white' : 'white') : '#9ca3af'}
                                  >
                                    {codigo}
                                  </text>
                                </g>
                              );
                            });
                          })}
                        </g>
                      );
                    })}

                    {/* Definición de degradados */}
                    <defs>
                      <linearGradient id="occupiedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                      
                      <linearGradient id="availableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      
                      <linearGradient id="rightAvailableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Navegación inferior */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Instrucciones:</span> 
                    <span className="ml-2">Haz clic en cualquier ubicación para ver detalles o editar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      Formato: Pasillo-Rack-Nivel
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}