 // src/app/productos/page.tsx
import { prisma } from '@/lib/prisma';
import { NewProductButton } from './components/ActionButtons';
import { ProductTable } from './components/ProductTable';

export default async function ProductosPage() {
  // Cargar primera página para Server Component (mejor SEO)
  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      take: 10,
      orderBy: { nombre: 'asc' },
    }),
    prisma.producto.count(),
  ]);

  const initialData = {
    productos,
    total,
    page: 1,
    totalPages: Math.ceil(total / 10),
  };

  return (
    <div className="p-4 sm:p-6">    
      <ProductTable initialData={initialData} />
    </div>
  );
}