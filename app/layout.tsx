import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SearchProvider } from './context/SearchContext';
import SearchBarContainer from './components/SearchBarContainer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Streaming Site",
  description: "Assista filmes e séries online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#141414]`}>
        <SearchProvider>
          <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-b from-black/80 via-black/60 to-transparent">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <Link href="/" className="text-3xl font-bold text-[#E50914]">
                    STREAMFLIX
                  </Link>
                  <div className="hidden md:flex items-center space-x-4">
                    <Link href="/" className="text-sm text-gray-200 hover:text-white transition-colors">
                      Início
                    </Link>
                    <Link href="/series" className="text-sm text-gray-200 hover:text-white transition-colors">
                      Séries
                    </Link>
                    <Link href="/filmes" className="text-sm text-gray-200 hover:text-white transition-colors">
                      Filmes
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="hidden md:block">
                    <SearchBarContainer className="w-[300px]" />
                  </div>
                  <div className="md:hidden">
                    <SearchBarContainer className="w-10" minimal={true} />
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="text-white hover:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                    </button>
                    <button className="text-white hover:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </header>
          <main className="pt-16">
            {children}
          </main>
        </SearchProvider>
      </body>
    </html>
  );
}
