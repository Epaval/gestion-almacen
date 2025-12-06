 // ✅ src/app/productos/components/DeleteButton.tsx
'use client';

import { useState } from 'react';

export function DeleteButton({ productId }: { productId: number }) {
  const handleDelete = async () => {
    if (!confirm('¿Eliminar producto?')) return;

    try {
      const res = await fetch(`/api/productos/${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {        
        window.location.reload();  
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (error) {
      alert('Error de red');
    }
  };
  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:underline"
    >
      Eliminar
    </button>
  );
}