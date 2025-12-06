 'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DeleteButton } from './DeleteButton';
import { UbicacionesModal } from './UbicacionesModal';
import { 
  Search, 
  Package, 
  Barcode, 
  QrCode, 
  Edit, 
  Eye, 
  Trash2, 
  Hash,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Filter,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  qrCode: string | null;
  cantidad: number;
  descripcion?: string;
  updatedAt?: string;
}

interface ApiResponse {
  productos: Producto[];
  total: number;
  page: number;
  totalPages: number;
}

export function ProductTable({ initialData }: { initialData: ApiResponse }) {
  const [data, setData] = useState<ApiResponse>(initialData);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(initialData.page);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const url = `/api/productos/list?page=${page}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const newData = await res.json();
        setData(newData);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const openModal = (productoId: number) => {
    setSelectedProductoId(productoId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProductoId(null);
  };

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const selectAllRows = () => {
    if (selectedRows.size === data.productos.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.productos.map(p => p.id)));
    }
  };

  const getStockStatus = (cantidad: number) => {
    if (cantidad === 0) return { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle, label: 'Agotado' };
    if (cantidad < 10) return { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle, label: 'Bajo' };
    return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle, label: 'Disponible' };
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header con buscador y acciones */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-linear-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Inventario de Productos</h2>
              </div>
              <p className="text-sm text-gray-600">
                Gestiona y organiza todos los productos del almacén
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/productos/nuevo"
                className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm"
              >
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Nuevo Producto</span>
              </Link>
              
              {selectedRows.size > 0 && (
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Eliminar ({selectedRows.size})</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código de barras, QR..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500 text-gray-900"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <span className="font-medium">{data.total}</span>
                )}{' '}
                productos en total
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado de stock</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
                    <option>Todos</option>
                    <option>Disponible</option>
                    <option>Bajo stock</option>
                    <option>Agotado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
                    <option>Nombre (A-Z)</option>
                    <option>Nombre (Z-A)</option>
                    <option>Cantidad (Mayor a menor)</option>
                    <option>Cantidad (Menor a mayor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mostrar</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
                    <option>10 por página</option>
                    <option>25 por página</option>
                    <option>50 por página</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        {data.productos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {search ? 'No se encontraron productos' : 'No hay productos registrados'}
              </h3>
              <p className="text-gray-500 mb-6">
                {search 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza agregando tu primer producto al inventario'}
              </p>
              {!search && (
                <Link
                  href="/productos/nuevo"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Crear primer producto
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-linear-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === data.productos.length && data.productos.length > 0}
                          onChange={selectAllRows}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Códigos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.productos.map((p) => {
                    const stockStatus = getStockStatus(p.cantidad);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-gray-50/80 transition-colors ${
                          selectedRows.has(p.id) ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(p.id)}
                            onChange={() => toggleRowSelection(p.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="p-2 bg-linear-to-br from-blue-100 to-blue-200 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">{p.nombre}</h4>
                              {p.descripcion && (
                                <p className="text-xs text-gray-500 line-clamp-1">{p.descripcion}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            {p.codigoBarras && (
                              <div className="flex items-center gap-2">
                                <Barcode className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                  {p.codigoBarras}
                                </span>
                              </div>
                            )}
                            {p.qrCode && (
                              <div className="flex items-center gap-2">
                                <QrCode className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                  {p.qrCode}
                                </span>
                              </div>
                            )}
                            {!p.codigoBarras && !p.qrCode && (
                              <span className="text-xs text-gray-400 italic">Sin códigos</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 rounded-lg">
                              <Hash className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">{p.cantidad}</span>
                            <span className="text-sm text-gray-500">unidades</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${stockStatus.bg}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${stockStatus.color}`} />
                            <span className={`text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(p.id)}
                              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group"
                              title="Ver ubicaciones"
                            >
                              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            
                            <Link
                              href={`/productos/${p.id}/editar`}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </Link>
                            
                            <DeleteButton productId={p.id} />
                            
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación mejorada */}
            {data.totalPages > 1 && (
              <div className="border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)}
                    </span>{' '}
                    de <span className="font-medium text-gray-900">{data.total}</span> productos
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                        let pageNum;
                        if (data.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= data.totalPages - 2) {
                          pageNum = data.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {data.totalPages > 5 && page < data.totalPages - 2 && (
                        <>
                          <span className="px-1 text-gray-400">...</span>
                          <button
                            onClick={() => setPage(data.totalPages)}
                            className="w-8 h-8 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            {data.totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages || loading}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Página <span className="font-medium text-gray-900">{page}</span> de{' '}
                    <span className="font-medium text-gray-900">{data.totalPages}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedProductoId && (
        <UbicacionesModal
          productoId={selectedProductoId}
          isOpen={modalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}