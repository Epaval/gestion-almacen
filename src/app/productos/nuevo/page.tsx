 'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  PlusCircle, 
  ArrowLeft, 
  Package, 
  Barcode, 
  QrCode, 
  FileText, 
  Hash,
  Save,
  X
} from 'lucide-react';

export default function NuevoProductoPage() {
  const [nombre, setNombre] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('0');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          codigoBarras: codigoBarras.trim() || undefined,
          qrCode: qrCode.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          cantidad: parseInt(cantidad, 10) || 0,
        }),
      });

      if (res.ok) {
        toast.success('✅ Producto creado exitosamente');
        router.push('/productos');
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.message || '❌ Error al crear el producto');
      }
    } catch (err) {
      toast.error('❌ Error de conexión. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header con icono y título */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <PlusCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nuevo Producto
              </h1>
              <p className="text-gray-600 mt-1">
                Agrega un nuevo artículo a tu inventario
              </p>
            </div>
          </div>
          
          {/* Breadcrumb o botón de regreso */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inventario
          </button>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200/50">
          {/* Header de la card */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Información del producto
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-10">
              Completa todos los campos obligatorios marcados con *
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* Nombre */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-700" />
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-800">
                  Nombre del producto <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                id="nombre"
                type="text"
                required
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-gray-900 bg-gray-50/50"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Destornillador Phillips #2"
              />
            </div>

            {/* Código de barras */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-gray-700" />
                <label htmlFor="codigoBarras" className="block text-sm font-semibold text-gray-800">
                  Código de barras
                </label>
              </div>
              <input
                id="codigoBarras"
                type="text"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-gray-900 bg-gray-50/50"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                placeholder="1234567890128 (EAN-13)"
              />
              <p className="text-xs text-gray-500 ml-7">
                Dejar vacío para generar automáticamente
              </p>
            </div>

            {/* Código QR */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-gray-700" />
                <label htmlFor="qrCode" className="block text-sm font-semibold text-gray-800">
                  Código QR (opcional)
                </label>
              </div>
              <input
                id="qrCode"
                type="text"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-gray-900 bg-gray-50/50"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="QR-PRODUCTO-001"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-700" />
                <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-800">
                  Descripción
                </label>
              </div>
              <textarea
                id="descripcion"
                rows={3}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-gray-900 bg-gray-50/50 resize-none"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles del producto: características, uso, materiales, dimensiones..."
              />
            </div>

            {/* Cantidad */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-700" />
                <label htmlFor="cantidad" className="block text-sm font-semibold text-gray-800">
                  Cantidad inicial <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  id="cantidad"
                  type="number"
                  min="0"
                  required
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-gray-900 bg-gray-50/50"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-sm font-medium text-gray-500">unidades</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Guardar producto
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm border border-gray-300/50"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>

            {/* Footer del formulario */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                <span className="text-red-500">*</span> Campos obligatorios
                <span className="mx-2">•</span>
                Los datos se guardarán en tu inventario
              </p>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Producto único</h3>
            </div>
            <p className="text-xs text-gray-600">
              Cada producto requiere un nombre único para evitar duplicados
            </p>
          </div>
          
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Barcode className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Códigos</h3>
            </div>
            <p className="text-xs text-gray-600">
              Los códigos de barras y QR ayudan en el escaneo rápido
            </p>
          </div>
          
          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Hash className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Inventario</h3>
            </div>
            <p className="text-xs text-gray-600">
              La cantidad inicial puede ajustarse después en movimientos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}