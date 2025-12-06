 // src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mostrar error si viene de una redirección (ej: sesión expirada)
  const callbackError = searchParams.get('error');
  if (callbackError && !error) {
    setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email o contraseña incorrectos.');
    } else {
      // Redirigir al panel principal
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Iniciar Sesión</h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded bg-blue-600 px-4 py-2 text-white transition ${
              loading ? 'opacity-70' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Usuario de prueba:</p>
          <p>
            <span className="font-mono bg-gray-100 px-1">admin@almacen.com</span> /{' '}
            <span className="font-mono bg-gray-100 px-1">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}