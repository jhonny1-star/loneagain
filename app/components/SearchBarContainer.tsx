'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearch } from '../context/SearchContext';
import SearchBar from './SearchBar';

interface SearchBarContainerProps {
  className?: string;
  minimal?: boolean;
}

export default function SearchBarContainer({ className = '', minimal = false }: SearchBarContainerProps) {
  const { 
    searchQuery, 
    setSearchQuery, 
    setIsSearching, 
    updateSearchTimestamp 
  } = useSearch();
  
  const [expanded, setExpanded] = useState(!minimal);
  const router = useRouter();
  const pathname = usePathname();

  // Expandir automaticamente se houver uma pesquisa ativa
  useEffect(() => {
    if (searchQuery && minimal && !expanded) {
      setExpanded(true);
    }
  }, [searchQuery, minimal, expanded]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    updateSearchTimestamp();
    
    // Redirecionar para a página de pesquisa se não estiver nela
    if (pathname !== '/search') {
      const timestamp = Date.now();
      router.push(`/search?q=${encodeURIComponent(query)}&t=${timestamp}`);
    }
  };

  const toggleExpand = () => {
    if (minimal) {
      setExpanded(!expanded);
      
      // Se estiver expandindo e houver uma pesquisa ativa, focar no input
      if (!expanded && searchQuery) {
        // O foco será tratado pelo autoFocus no SearchBar
      }
    }
  };

  if (minimal && !expanded) {
    return (
      <button 
        onClick={toggleExpand}
        className="text-gray-400 hover:text-white p-2 relative"
        aria-label="Abrir pesquisa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>
    );
  }

  return (
    <div className={`transition-all duration-300 ${className} ${minimal ? 'w-full max-w-xs' : ''}`}>
      <div className="flex items-center">
        <SearchBar 
          onSearch={handleSearch} 
          placeholder={minimal ? 'Buscar...' : 'Buscar filmes, séries...'}
          autoFocus={minimal && expanded}
        />
        
        {minimal && expanded && (
          <button 
            onClick={() => setExpanded(false)}
            className="ml-2 text-gray-400 hover:text-white"
            aria-label="Fechar pesquisa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 