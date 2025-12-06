 
import { ArrowPathIcon, BuildingStorefrontIcon, MapIcon, QrCodeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const stats = [
    { name: 'Productos', value: '124', icon: BuildingStorefrontIcon, color: 'bg-blue-500' },
    { name: 'Ubicaciones', value: '32', icon: MapIcon, color: 'bg-emerald-500' },
    { name: 'Códigos escaneados', value: '1.2K', icon: QrCodeIcon, color: 'bg-amber-500' },
    { name: 'Usuarios activos', value: '3', icon: UserGroupIcon, color: 'bg-purple-500' },
  ];

  const features = [
    { title: 'Gestión de Productos', desc: 'CRUD completo, códigos de barras y QR', icon: BuildingStorefrontIcon },
    { title: 'Ubicaciones del Almacén', desc: 'Organiza zonas, estantes y niveles', icon: MapIcon },
    { title: 'Mapa 2D Interactivo', desc: 'Visualiza y gestiona tu almacén en tiempo real', icon: ArrowPathIcon },
    { title: 'Roles y Permisos', desc: 'Admin, supervisor y operario con accesos diferenciados', icon: UserGroupIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
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
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.name} className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-md ${item.color}`}>
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
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Funcionalidades Disponibles</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.title} className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
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
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/productos/nuevo"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
            >
              + Nuevo Producto
            </a>
            <a
              href="/productos"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Ver Inventario
            </a>
            <a
              href="/mapa"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Ver Mapa del Almacén
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}