 'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react'; // ✅ Importa signOut

// ✅ Importa el nuevo componente de búsqueda
import BuscadorUbicaciones from './BuscadorUbicaciones';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Productos', href: '/productos' },
    { name: 'Ubicaciones', href: '/ubicaciones' },
    { name: 'Mapa', href: '/mapa' },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Barra de navegación principal */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Título */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Almacén Pro</h1>
            </div>

            {/* Menú desktop */}
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/productos/nuevo"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                + Nuevo Producto
              </Link>

              {/* ✅ Botón de logout (desktop) */}
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Cerrar sesión
              </button>
            </nav>

            {/* Menú móvil (hamburguesa) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegado */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/productos/nuevo"
                className="mt-2 block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-blue-700 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                + Nuevo Producto
              </Link>

              {/* ✅ Botón de logout (móvil) */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 block w-full text-center text-red-600 px-4 py-2 rounded-lg text-base font-medium hover:bg-red-50 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ✅ Buscador global de ubicaciones */}
      <div className="bg-gray-50 border-b border-gray-200 py-3">
        <BuscadorUbicaciones />
      </div>
    </>
  );
};

export default Navbar;