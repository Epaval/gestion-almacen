// src/app/productos/components/ActionButtons.tsx
'use client';

import { useRouter } from 'next/navigation';

export function NewProductButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/productos/nuevo')}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
    >
      Nuevo Producto
    </button>
  );
}