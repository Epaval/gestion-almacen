import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/app/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen pt-24">{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}