// src/app/components/BuscadorUbicaciones.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface UbicacionAsignada {
  ubicacion: {
    nombre: string;
    pasillo: number;
    lado: string;
    letra: string;
    nivel: number;
  };
  cantidad: number;
}

interface ProductoResultado {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  qrCode: string | null;
  cantidadTotal: number;
}

export default function BuscadorUbicaciones() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    producto: ProductoResultado;
    ubicaciones: UbicacionAsignada[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buscarProducto = async (codigo: string) => {
    if (!codigo.trim()) {
      setResultado(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/productos/buscar?codigo=${encodeURIComponent(codigo.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResultado(data);
        setError(null);
      } else {
        const err = await res.json();
        setError(err.error || 'Producto no encontrado');
        setResultado(null);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-focus en escritorio
  useEffect(() => {
    if (inputRef.current && window.innerWidth >= 768) {
      inputRef.current.focus();
    }
  }, []);

  // Buscar cuando cambia el código (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProducto(codigo);
    }, 300);
    return () => clearTimeout(timer);
  }, [codigo]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Campo de búsqueda */}
      <div className="flex">
        <input
          ref={inputRef}
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Escanear o escribir código de barras / QR"
          className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <button
          onClick={() => setCodigo('')}
          disabled={!codigo}
          className="px-4 bg-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-300 disabled:opacity-50"
        >
          ✕
        </button>
      </div>

      {/* Resultados */}
      {loading && (
        <div className="mt-4 text-center text-gray-600">Buscando...</div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      {resultado && (
        <div className="mt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900">{resultado.producto.nombre}</h3>
            <p className="text-sm text-gray-600">
              Código: {resultado.producto.codigoBarras || resultado.producto.qrCode}
            </p>
            <p className="text-sm font-medium text-gray-900">
              Stock total: {resultado.producto.cantidadTotal} unidad(es)
            </p>
          </div>

          <h4 className="text-md font-semibold text-gray-900 mb-2">Ubicaciones asignadas</h4>
          {resultado.ubicaciones.length === 0 ? (
            <p className="text-gray-500 italic">Este producto no está asignado a ninguna ubicación.</p>
          ) : (
            <div className="space-y-2">
              {resultado.ubicaciones.map((u, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{u.ubicacion.nombre}</div>
                    <div className="text-sm text-gray-600">
                      Pasillo {u.ubicacion.pasillo}, {u.ubicacion.lado}, Nivel {u.ubicacion.nivel}
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {u.cantidad} unidad(es)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}