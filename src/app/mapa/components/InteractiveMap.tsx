 'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Package, 
  Layout, 
  ChevronRight, 
  ChevronDown,
  Zap,
  Info,
  Grid,
  Maximize2,
  Search,
  Filter,
  Building,
  Warehouse,
  X,
  Check,
  AlertCircle,
  Menu,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Download,
  Navigation,
  Minimize2
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
  capacidadMaxima?: number;
  tipo?: 'estanteria' | 'piso' | 'especial';
}

interface InteractiveMapProps {
  ubicaciones: Ubicacion[];
}

// Función debounce personalizada
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function InteractiveMap({ ubicaciones }: InteractiveMapProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPasillo, setSelectedPasillo] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLegend, setShowLegend] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    soloOcupadas: false,
    soloDisponibles: false,
    nivelMin: 1,
    nivelMax: 5,
    tipos: ['estanteria', 'piso', 'especial'] as string[],
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // Detectar dispositivo y redimensionar
  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      // En modo pantalla completa, usar el ancho real sin considerar el umbral móvil
      if (isFullscreen) {
        setIsMobile(false); // Forzar modo desktop en pantalla completa
      } else {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        // En móvil, ocultar leyenda por defecto para ahorrar espacio
        if (mobile && showLegend) {
          setShowLegend(false);
        }
      }
    };
    
    checkMobile();
    
    // Debounce personalizado para resize
    const handleResize = debounce(checkMobile, 150);
    window.addEventListener('resize', handleResize);
    
    // Detectar cambios en pantalla completa
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);
      if (!isFullscreenNow) {
        // Al salir de pantalla completa, recalcular modo móvil
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isFullscreen, showLegend]);

  // Efecto para cerrar resultados de búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para entrar/salir de pantalla completa
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // Entrar en pantalla completa
        const element = isMobile ? mapContainerRef.current : fullscreenContainerRef.current;
        if (element) {
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen();
          } else if ((element as any).mozRequestFullScreen) {
            await (element as any).mozRequestFullScreen();
          } else if ((element as any).msRequestFullscreen) {
            await (element as any).msRequestFullscreen();
          }
          setIsFullscreen(true);
          setIsMobile(false); // Forzar modo desktop en pantalla completa
        }
      } else {
        // Salir de pantalla completa
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error al cambiar pantalla completa:', error);
    }
  }, [isMobile]);

  const handleUbicacionClick = useCallback((ubicacionId: number) => {
    router.push(`/ubicaciones/${ubicacionId}`);
  }, [router]);

  // Gestión de gestos táctiles para zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setTouchStart({ x: distance, y: zoomLevel });
    }
  }, [zoomLevel]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = distance / touchStart.x;
      const newZoom = Math.min(Math.max(0.5, touchStart.y * scale), 3);
      setZoomLevel(newZoom);
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);

  const pasillos = Array.from({ length: 15 }, (_, i) => i + 1);
  const letrasIzq = ['A', 'B', 'C', 'D', 'E'];
  const letrasDer = ['F', 'G', 'H', 'I', 'J'];
  const niveles = 5;

  // Generar nomenclatura de ubicación
  const getNomenclatura = useCallback((pasillo: number, letra: string, nivel: number, lado: string) => {
    const pasilloStr = pasillo.toString().padStart(2, '0');
    return `${pasilloStr}-${letra}-${nivel}`;
  }, []);

  // Filtrar ubicaciones
  const filteredUbicaciones = ubicaciones.filter(u => {
    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        u.nombre.toLowerCase().includes(searchLower) ||
        u.letra.toLowerCase().includes(searchLower) ||
        u.pasillo.toString().includes(searchTerm) ||
        getNomenclatura(u.pasillo, u.letra, u.nivel, u.lado).toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filtro por ocupación
    if (filterOptions.soloOcupadas && !u.tieneProductos) return false;
    if (filterOptions.soloDisponibles && u.tieneProductos) return false;

    // Filtro por nivel
    if (u.nivel < filterOptions.nivelMin || u.nivel > filterOptions.nivelMax) return false;

    // Filtro por tipo
    if (!filterOptions.tipos.includes(u.tipo || 'estanteria')) return false;

    return true;
  });

  // Buscar ubicaciones para sugerencias
  const searchSuggestions = searchTerm ? ubicaciones
    .filter(u => 
      getNomenclatura(u.pasillo, u.letra, u.nivel, u.lado)
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase())
    )
    .slice(0, 5) : [];

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

  // Componente de leyenda optimizado para móvil
  const Legend = () => (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">Leyenda del Mapa</h3>
        </div>
        <button
          onClick={() => setShowLegend(false)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Ocultar leyenda"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-blue-700">Disponible</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
            <div className="w-3 h-3 bg-amber-500 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-amber-700">Ocupado</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
            <div className="w-3 h-3 bg-gray-400 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-gray-700">Vacío</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
            <div className="w-3 h-3 bg-emerald-500 rounded shadow-sm"></div>
            <span className="text-xs font-medium text-emerald-700">Especial</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-2">Código de ubicación:</div>
          <div className="bg-gray-50 p-2 rounded-lg font-mono text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-blue-600 font-bold">01</span>
              <span className="text-gray-400">-</span>
              <span className="text-emerald-600 font-bold">A</span>
              <span className="text-gray-400">-</span>
              <span className="text-amber-600 font-bold">1</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Pasillo-Rack-Nivel</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Filtros móviles desplegables
  const MobileFilters = () => (
    <div className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
      showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
        showFilters ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Estado</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterOptions(prev => ({
                    ...prev,
                    soloOcupadas: !prev.soloOcupadas,
                    soloDisponibles: false
                  }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    filterOptions.soloOcupadas
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Solo ocupadas
                </button>
                <button
                  onClick={() => setFilterOptions(prev => ({
                    ...prev,
                    soloDisponibles: !prev.soloDisponibles,
                    soloOcupadas: false
                  }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    filterOptions.soloDisponibles
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Solo disponibles
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Niveles: {filterOptions.nivelMin} - {filterOptions.nivelMax}
              </label>
              <div className="px-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={filterOptions.nivelMin}
                  onChange={(e) => setFilterOptions(prev => ({
                    ...prev,
                    nivelMin: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={filterOptions.nivelMax}
                  onChange={(e) => setFilterOptions(prev => ({
                    ...prev,
                    nivelMax: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipos</label>
              <div className="flex flex-wrap gap-2">
                {['estanteria', 'piso', 'especial'].map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setFilterOptions(prev => ({
                      ...prev,
                      tipos: prev.tipos.includes(tipo)
                        ? prev.tipos.filter(t => t !== tipo)
                        : [...prev.tipos, tipo]
                    }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterOptions.tipos.includes(tipo)
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tipo === 'estanteria' ? 'Estantería' : 
                     tipo === 'piso' ? 'Piso' : 'Especial'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setFilterOptions({
                soloOcupadas: false,
                soloDisponibles: false,
                nivelMin: 1,
                nivelMax: 5,
                tipos: ['estanteria', 'piso', 'especial']
              })}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
            >
              Limpiar
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Control de zoom flotante para móvil
  const ZoomControls = () => (
    <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-2">
      <button
        onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
        className="p-3 bg-white shadow-lg rounded-full border border-gray-200 active:scale-95 transition-transform"
        aria-label="Acercar"
      >
        <ZoomIn className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
        className="p-3 bg-white shadow-lg rounded-full border border-gray-200 active:scale-95 transition-transform"
        aria-label="Alejar"
      >
        <ZoomOut className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={() => setZoomLevel(1)}
        className="p-3 bg-white shadow-lg rounded-full border border-gray-200 active:scale-95 transition-transform"
        aria-label="Restablecer zoom"
      >
        <Navigation className="w-5 h-5 text-blue-600" />
      </button>
    </div>
  );

  // Loading state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 p-6">
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

  // Contenedor principal para pantalla completa
  const MainContainer = ({ children }: { children: React.ReactNode }) => (
    <div 
      ref={fullscreenContainerRef}
      className={`${
        isFullscreen 
          ? 'fixed inset-0 z-9999 bg-linear-to-br from-gray-50 to-gray-100 overflow-auto' 
          : 'min-h-screen bg-linear-to-b from-gray-50 to-gray-100 safe-area-padding'
      }`}
    >
      {children}
    </div>
  );

  // Vista móvil optimizada (solo si no está en pantalla completa)
  if (isMobile && !isFullscreen) {
    return (
      <>
        <MobileFilters />
        <ZoomControls />
        
        <MainContainer>
          {/* Header sticky */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl">
                  <Warehouse className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Mapa Almacén</h1>
                  <p className="text-xs text-gray-500">Pasillo-Rack-Nivel</p>
                </div>
              </div>
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Mostrar/ocultar leyenda"
              >
                {showLegend ? (
                  <EyeOff className="w-5 h-5 text-gray-700" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative" ref={searchInputRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ubicación (ej: 01-A-1)..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
              />
              
              {/* Sugerencias de búsqueda */}
              {showSearchResults && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchSuggestions.map(suggestion => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        handleUbicacionClick(suggestion.id);
                        setShowSearchResults(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {getNomenclatura(suggestion.pasillo, suggestion.letra, suggestion.nivel, suggestion.lado)}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {suggestion.nombre}
                        </div>
                      </div>
                      {suggestion.tieneProductos ? (
                        <Package className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filtros rápidos */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {Object.values(filterOptions).some(v => 
                  Array.isArray(v) ? v.length < 3 : v !== false && v !== 1 && v !== 5
                ) && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              
              <button
                onClick={() => setFilterOptions(prev => ({
                  ...prev,
                  soloOcupadas: !prev.soloOcupadas,
                  soloDisponibles: false
                }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filterOptions.soloOcupadas
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Ocupadas
              </button>
              
              <button
                onClick={() => setFilterOptions(prev => ({
                  ...prev,
                  soloDisponibles: !prev.soloDisponibles,
                  soloOcupadas: false
                }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filterOptions.soloDisponibles
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Disponibles
              </button>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                <Package className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{filteredUbicaciones.length}</span>
              </div>
            </div>
          </header>

          {/* Contenido principal */}
          <main className="p-4" ref={mapContainerRef}>
            {showLegend && (
              <div className="mb-4 animate-slideDown">
                <Legend />
              </div>
            )}

            {/* Pasillos con scroll horizontal */}
            <div 
              className="overflow-x-auto pb-4 scrollbar-hide"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                minHeight: `${200 * zoomLevel}px`
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex gap-3" style={{ minWidth: `${pasillos.length * 280}px` }}>
                {pasillos.map(pasillo => {
                  const ubicacionesPasillo = ubicacionesPorPasillo[pasillo];
                  const totalUbicaciones = ubicacionesPasillo.izq.length + ubicacionesPasillo.der.length;
                  const ocupadas = ubicacionesPasillo.izq.concat(ubicacionesPasillo.der)
                    .filter(u => u.tieneProductos).length;

                  return (
                    <div
                      key={pasillo}
                      className="shrink-0 w-[280px]"
                    >
                      {/* Tarjeta del pasillo */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Header del pasillo */}
                        <div 
                          className="p-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white cursor-pointer"
                          onClick={() => setSelectedPasillo(
                            selectedPasillo === pasillo ? null : pasillo
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Building className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  Pasillo {pasillo.toString().padStart(2, '0')}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600">
                                      {totalUbicaciones - ocupadas} libres
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600">
                                      {ocupadas} ocupadas
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                              selectedPasillo === pasillo ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </div>

                        {/* Contenido expandible */}
                        {(selectedPasillo === pasillo || selectedPasillo === null) && (
                          <div className="p-3">
                            <div className="grid grid-cols-2 gap-3">
                              {/* Lado izquierdo */}
                              <div>
                                <div className="mb-2">
                                  <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                    Lado A-E
                                  </h4>
                                </div>
                                <div className="space-y-1.5">
                                  {letrasIzq.map(letra => 
                                    Array.from({ length: niveles }, (_, nivelIdx) => {
                                      const nivel = nivelIdx + 1;
                                      const u = ubicacionesPasillo.izq.find(
                                        x => x.letra === letra && x.nivel === nivel
                                      );
                                      const codigo = getNomenclatura(pasillo, letra, nivel, 'izquierdo');
                                      
                                      return (
                                        <button
                                          key={`${letra}-${nivel}`}
                                          onClick={() => u && handleUbicacionClick(u.id)}
                                          disabled={!u}
                                          className={`w-full p-2 rounded-lg flex items-center justify-between transition-all active:scale-[0.98] ${
                                            u
                                              ? u.tieneProductos
                                                ? 'bg-linear-to-r from-amber-50 to-amber-100 border border-amber-200'
                                                : 'bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200'
                                              : 'bg-gray-100 border border-gray-200'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                              u
                                                ? u.tieneProductos
                                                  ? 'bg-amber-500'
                                                  : 'bg-blue-500'
                                                : 'bg-gray-400'
                                            }`}></div>
                                            <span className={`text-sm font-medium ${
                                              u
                                                ? u.tieneProductos
                                                  ? 'text-amber-800'
                                                  : 'text-blue-800'
                                                : 'text-gray-500'
                                            }`}>
                                              {codigo}
                                            </span>
                                          </div>
                                          {u?.tieneProductos && (
                                            <Package className="w-3 h-3 text-amber-600" />
                                          )}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Lado derecho */}
                              <div>
                                <div className="mb-2">
                                  <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                                    Lado F-J
                                  </h4>
                                </div>
                                <div className="space-y-1.5">
                                  {letrasDer.map(letra => 
                                    Array.from({ length: niveles }, (_, nivelIdx) => {
                                      const nivel = nivelIdx + 1;
                                      const u = ubicacionesPasillo.der.find(
                                        x => x.letra === letra && x.nivel === nivel
                                      );
                                      const codigo = getNomenclatura(pasillo, letra, nivel, 'derecho');
                                      
                                      return (
                                        <button
                                          key={`${letra}-${nivel}`}
                                          onClick={() => u && handleUbicacionClick(u.id)}
                                          disabled={!u}
                                          className={`w-full p-2 rounded-lg flex items-center justify-between transition-all active:scale-[0.98] ${
                                            u
                                              ? u.tieneProductos
                                                ? 'bg-linear-to-r from-amber-50 to-amber-100 border border-amber-200'
                                                : 'bg-linear-to-r from-emerald-50 to-emerald-100 border border-emerald-200'
                                              : 'bg-gray-100 border border-gray-200'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                              u
                                                ? u.tieneProductos
                                                  ? 'bg-amber-500'
                                                  : 'bg-emerald-500'
                                                : 'bg-gray-400'
                                            }`}></div>
                                            <span className={`text-sm font-medium ${
                                              u
                                                ? u.tieneProductos
                                                  ? 'text-amber-800'
                                                  : 'text-emerald-800'
                                                : 'text-gray-500'
                                            }`}>
                                              {codigo}
                                            </span>
                                          </div>
                                          {u?.tieneProductos && (
                                            <Package className="w-3 h-3 text-amber-600" />
                                          )}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Acción rápida */}
                            <button
                              onClick={() => {
                                const firstAvailable = ubicacionesPasillo.izq
                                  .concat(ubicacionesPasillo.der)
                                  .find(u => !u.tieneProductos);
                                if (firstAvailable) {
                                  handleUbicacionClick(firstAvailable.id);
                                }
                              }}
                              className="mt-3 w-full py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm active:scale-[0.98] transition-transform"
                            >
                              Asignar ubicación disponible
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Indicador de zoom */}
            <div className="fixed bottom-4 left-4 z-30 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Zoom: {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Botón flotante para scroll rápido */}
            {selectedPasillo && (
              <button
                onClick={() => {
                  setSelectedPasillo(null);
                  mapContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-white shadow-lg px-4 py-2 rounded-full border border-gray-200 flex items-center gap-2 text-sm font-medium active:scale-95 transition-transform"
              >
                <ChevronDown className="w-4 h-4" />
                Ver todos los pasillos
              </button>
            )}
          </main>
        </MainContainer>
      </>
    );
  }

  // ✅ VISTA DESKTOP (incluye pantalla completa)
  // Calcular dimensiones del mapa SVG
  const anchoColumna = isFullscreen ? 60 : 50; // Más grande en pantalla completa
  const separacionEntreLados = isFullscreen ? 140 : 120;
  const anchoPorPasillo = anchoColumna * 2 + separacionEntreLados + 30;
  const alturaPorNivel = isFullscreen ? 20 : 16;
  const alturaPorLetra = niveles * alturaPorNivel + 20;
  const alturaTotal = 80 + 5 * alturaPorLetra + 50;
  const anchoTotal = pasillos.length * anchoPorPasillo + 100;

  return (
    <MainContainer>
      <div className={`${isFullscreen ? 'h-full overflow-auto p-6' : 'max-w-7xl mx-auto p-6'}`}>
        {/* Header */}
        <div className={`${isFullscreen ? 'mb-4' : 'mb-8'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Warehouse className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`${isFullscreen ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
                  {isFullscreen ? 'Mapa Completo del Almacén' : 'Mapa Interactivo del Almacén'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Sistema de ubicación: Pasillo-Rack-Nivel (Ej: 01-A-1, 10-C-3)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Salir pantalla completa</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Pantalla completa</span>
                  </>
                )}
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setShowLegend(!showLegend)}
              >
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {showLegend ? 'Ocultar' : 'Mostrar'} leyenda
                </span>
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
          <div className={`grid ${showLegend ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
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

            <div className={`${showLegend ? 'lg:col-span-3' : 'col-span-1'}`}>
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
                              fontSize={isFullscreen ? "16" : "14"}
                              fontWeight="bold"
                              fill="#1f2937"
                            >
                              Pasillo {pasillo.toString().padStart(2, '0')}
                            </text>
                            <text
                              x={x + (anchoPorPasillo - 20) / 2}
                              y="58"
                              textAnchor="middle"
                              fontSize={isFullscreen ? "12" : "10"}
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
                                    height={alturaPorNivel - 4}
                                    rx="4"
                                    fill="rgba(0,0,0,0.1)"
                                    opacity="0.2"
                                  />
                                  
                                  {/* Ubicación */}
                                  <rect
                                    x={x}
                                    y={y}
                                    width={anchoColumna}
                                    height={alturaPorNivel - 4}
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
                                    y={y + (alturaPorNivel - 4) / 2 + (isFullscreen ? 3 : 2)}
                                    textAnchor="middle"
                                    fontSize={isFullscreen ? "7" : "6"}
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
                                    height={alturaPorNivel - 4}
                                    rx="4"
                                    fill="rgba(0,0,0,0.1)"
                                    opacity="0.2"
                                  />
                                  
                                  {/* Ubicación */}
                                  <rect
                                    x={x + anchoColumna + separacionEntreLados}
                                    y={y}
                                    width={anchoColumna}
                                    height={alturaPorNivel - 4}
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
                                    y={y + (alturaPorNivel - 4) / 2 + (isFullscreen ? 3 : 2)}
                                    textAnchor="middle"
                                    fontSize={isFullscreen ? "7" : "6"}
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
                    {isFullscreen && (
                      <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        <Minimize2 className="w-3 h-3" />
                        Salir pantalla completa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}

 
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

.safe-area-padding {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Mejoras de scroll para móvil */
@media (max-width: 768px) {
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

/* Mejoras para pantalla completa */
:fullscreen {
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
}

:-webkit-full-screen {
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
}

:-moz-full-screen {
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
}

:-ms-fullscreen {
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
}
`;

// Añade los estilos al documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}