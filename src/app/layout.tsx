import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Streaming Site',
  description: 'Assista filmes e séries online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              Streaming Site
            </Link>
            <div className="space-x-4">
              <Link href="/" className="hover:text-gray-300">
                Filmes
              </Link>
              <Link href="/series" className="hover:text-gray-300">
                Séries
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
} 