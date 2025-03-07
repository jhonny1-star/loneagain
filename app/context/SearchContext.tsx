'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  resetSearch: () => void;
  lastSearchTimestamp: number | null;
  updateSearchTimestamp: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchTimestamp, setLastSearchTimestamp] = useState<number | null>(null);

  // Função para resetar o estado de busca
  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    setLastSearchTimestamp(null);
  }, []);

  // Função para atualizar o timestamp da busca
  const updateSearchTimestamp = useCallback(() => {
    setLastSearchTimestamp(Date.now());
  }, []);

  return (
    <SearchContext.Provider 
      value={{ 
        searchQuery, 
        setSearchQuery, 
        isSearching, 
        setIsSearching, 
        resetSearch,
        lastSearchTimestamp,
        updateSearchTimestamp
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 