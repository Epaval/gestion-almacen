// src/app/components/HomePageContent.tsx
import Link from 'next/link';
import { 
  BuildingStorefrontIcon, 
  MapIcon, 
  QrCodeIcon, 
  UserGroupIcon,
  ArrowPathIcon,
  PlusIcon,
  Squares2X2Icon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface StatItem {
  name: string;
  value: string;
}

interface HomePageContentProps {
  stats: StatItem[];
}

export default function HomePageContent({ stats }: HomePageContentProps) {
  const features = [
    { 
      title: 'Gestión de Productos', 
      desc: 'CRUD completo, códigos de barras y QR', 
      icon: BuildingStorefrontIcon 
    },
    { 
      title: 'Ubicaciones del Almacén', 
      desc: 'Organiza zonas, estantes y niveles', 
      icon: MapIcon 
    },
    { 
      title: 'Mapa 2D Interactivo', 
      desc: 'Visualiza y gestiona tu almacén en tiempo real', 
      icon: ArrowPathIcon 
    },
    { 
      title: 'Roles y Permisos', 
      desc: 'Admin, supervisor y operario con accesos diferenciados', 
      icon: UserGroupIcon 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
            Dashboard de Gestión de Almacén
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenido de nuevo. Aquí tienes un resumen de tu operación.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900">Resumen Rápido</h2>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => {
              const IconComponent = 
                item.name === 'Productos' ? BuildingStorefrontIcon :
                item.name === 'Ubicaciones' ? MapIcon :
                item.name === 'Códigos escaneados' ? QrCodeIcon :
                UserGroupIcon;

              const color = 
                item.name === 'Productos' ? 'bg-blue-500' :
                item.name === 'Ubicaciones' ? 'bg-emerald-500' :
                item.name === 'Códigos escaneados' ? 'bg-amber-500' :
                'bg-purple-500';

              return (
                <div 
                  key={item.name} 
                  className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
                        <IconComponent className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <div className="ml-4">
                        <dt className="text-sm font-medium text-gray-500">{item.name}</dt>
                        <dd className="text-2xl font-bold text-gray-900">{item.value}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900">Funcionalidades Disponibles</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={feature.title} 
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <IconComponent className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/productos/nuevo"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none transition"
            >
              <PlusIcon className="h-4 w-4" />
              Nuevo Producto
            </Link>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <Squares2X2Icon className="h-4 w-4" />
              Ver Inventario
            </Link>
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <MapPinIcon className="h-4 w-4" />
              Ver Mapa del Almacén
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}