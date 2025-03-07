'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../context/SearchContext';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = 'Buscar filmes, séries...', 
  className = '',
  autoFocus = false
}: SearchBarProps) {
  const { 
    searchQuery, 
    setSearchQuery, 
    isSearching, 
    setIsSearching, 
    resetSearch,
    updateSearchTimestamp 
  } = useSearch();
  
  const [query, setQuery] = useState(searchQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const lastSearchRef = useRef<string>('');

  // Sincronizar com o contexto global
  useEffect(() => {
    if (searchQuery !== query) {
      setQuery(searchQuery || '');
    }
  }, [searchQuery]);

  // Auto-focus se necessário
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Efeito para detectar a tecla Escape para limpar a pesquisa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('');
        resetSearch();
        lastSearchRef.current = '';
        inputRef.current?.blur();
      }
      
      // Atalho Ctrl+K ou Cmd+K para focar na pesquisa
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetSearch]);

  // Função para lidar com a submissão da pesquisa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Sempre definir isSearching como true para forçar uma nova busca
      setIsSearching(true);
      setSearchQuery(query.trim());
      lastSearchRef.current = query.trim();
      updateSearchTimestamp();
      executeSearch(query.trim());
    }
  };

  const executeSearch = (searchTerm: string) => {
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      // Se não houver função onSearch, redirecionar para a página de pesquisa
      const timestamp = Date.now();
      
      // Se já estiver na página de busca, atualizar a URL com o timestamp
      if (window.location.pathname === '/search') {
        router.push(`/search?q=${encodeURIComponent(searchTerm)}&t=${timestamp}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchTerm)}&t=${timestamp}`);
      }
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Se o campo estiver vazio, limpar a pesquisa global também
    if (!newQuery) {
      resetSearch();
      lastSearchRef.current = '';
    }
  };

  // Função para limpar a busca
  const clearSearch = () => {
    setQuery('');
    resetSearch();
    lastSearchRef.current = '';
    
    // Se estiver na página de busca, voltar para a página inicial
    if (window.location.pathname === '/search') {
      router.push('/');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'bg-gray-800' : 'bg-gray-900'} rounded-full overflow-hidden`}>
          <div className="pl-4 pr-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="py-2 px-2 w-full bg-transparent text-white outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="pr-4 text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>
      
      {isFocused && (
        <div className="absolute right-0 mt-1 text-xs text-gray-400">
          Pressione ESC para limpar ou ENTER para buscar
        </div>
      )}
    </div>
  );
} 