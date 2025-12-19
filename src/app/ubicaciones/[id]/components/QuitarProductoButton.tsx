 // src/app/ubicaciones/[id]/components/QuitarProductoButton.tsx
'use client';

import { Trash2 } from 'lucide-react';
import { useTransition, useState } from 'react';

interface QuitarProductoButtonProps {
  asignacionId: number;
  onQuitar: (asignacionId: number) => Promise<void>;
}

export function QuitarProductoButton({ asignacionId, onQuitar }: QuitarProductoButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuitar = () => {
    startTransition(async () => {
      await onQuitar(asignacionId);
      setIsModalOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" />
        {isPending ? 'Quitando...' : 'Quitar producto'}
      </button>

      {/* Modal de confirmación */}
      {isModalOpen && (
        <>
          {/* Overlay oscuro */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Contenido del modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in-90 zoom-in-90 duration-200"
              onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic dentro
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">¿Quitar producto?</h3>
                </div>

                <p className="text-gray-600 mb-6">
                  Esta acción eliminará la asignación del producto a esta ubicación. ¿Estás seguro?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleQuitar}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70"
                  >
                    {isPending ? 'Quitando...' : 'Sí, quitar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}