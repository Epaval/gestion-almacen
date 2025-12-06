// src/app/ubicaciones/[id]/components/QuitarProductoButton.tsx
'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface QuitarProductoButtonProps {
  asignacionId: number;
  onQuitar: (asignacionId: number) => Promise<void>;
}

export function QuitarProductoButton({ asignacionId, onQuitar }: QuitarProductoButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (confirm('¿Estás seguro de quitar este producto de la ubicación?')) {
      startTransition(async () => {
        await onQuitar(asignacionId);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? 'Quitando...' : 'Quitar producto'}
    </button>
  );
}