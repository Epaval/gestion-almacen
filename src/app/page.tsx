 // src/app/page.tsx
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import HomePageContent from '@/app/components/HomePageContent';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Cargar datos reales
  const totalProductos = await prisma.producto.count();
  const totalUbicaciones = await prisma.ubicacion.count();
  const totalUsuarios = await prisma.usuario.count();
  const codigosEscaneados = await prisma.producto.count({
    where: {
      OR: [{ codigoBarras: { not: null } }, { qrCode: { not: null } }],
    },
  });

  return (
    <HomePageContent
      stats={[
        { name: 'Productos', value: totalProductos.toLocaleString() },
        { name: 'Ubicaciones', value: totalUbicaciones.toLocaleString() },
        { name: 'Códigos escaneados', value: codigosEscaneados.toLocaleString() },
        { name: 'Usuarios', value: totalUsuarios.toLocaleString() },
      ]}
    />
  );
}