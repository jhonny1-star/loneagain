'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiUrl } from '../../config/xtream';
import { useSearch } from '../context/SearchContext';
import Loading from '../components/Loading';
import Link from 'next/link';

interface Movie {
  stream_id: number;
  name: string;
  stream_icon: string;
  rating: string;
  genre?: string;
  plot?: string;
  type: 'movie';
}

interface Series {
  series_id: number;
  name: string;
  cover: string;
  rating: string;
  genre: string;
  plot: string;
  type: 'series';
}

type SearchResult = Movie | Series;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const timestamp = searchParams.get('t');
  const filterType = searchParams.get('type') || 'all';
  const { 
    setSearchQuery, 
    isSearching, 
    setIsSearching, 
    resetSearch,
    lastSearchTimestamp,
    updateSearchTimestamp 
  } = useSearch();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousQuery, setPreviousQuery] = useState('');

  useEffect(() => {
    if (query && (query !== previousQuery || timestamp)) {
      setSearchQuery(query);
      setIsSearching(true);
      updateSearchTimestamp();
      setPreviousQuery(query);
      searchContent(query);
    } else if (!query) {
      setResults([]);
      setLoading(false);
      resetSearch();
    }
  }, [query, timestamp, setSearchQuery, setIsSearching, previousQuery, resetSearch, updateSearchTimestamp]);

  const searchContent = useCallback(async (searchQuery: string) => {
    setLoading(true);
    
    try {
      const moviesResponse = await axios.get(getApiUrl('get_vod_streams'));
      let movies: Movie[] = [];
      
      if (moviesResponse.data && Array.isArray(moviesResponse.data)) {
        movies = moviesResponse.data
          .filter((movie: any) => 
            movie.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((movie: any) => ({
            ...movie,
            type: 'movie'
          }));
      }
      
      const seriesResponse = await axios.get(getApiUrl('get_series'));
      let series: Series[] = [];
      
      if (seriesResponse.data && Array.isArray(seriesResponse.data)) {
        series = seriesResponse.data
          .filter((serie: any) => 
            serie.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((serie: any) => ({
            ...serie,
            type: 'series'
          }));
      }
      
      let combinedResults: SearchResult[] = [];
      
      if (filterType === 'all') {
        combinedResults = [...movies, ...series];
      } else if (filterType === 'movies') {
        combinedResults = movies;
      } else if (filterType === 'series') {
        combinedResults = series;
      }
      
      combinedResults.sort((a, b) => {
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();
        const queryLower = searchQuery.toLowerCase();
        
        if (aNameLower === queryLower && bNameLower !== queryLower) return -1;
        if (bNameLower === queryLower && aNameLower !== queryLower) return 1;
        
        if (aNameLower.startsWith(queryLower) && !bNameLower.startsWith(queryLower)) return -1;
        if (bNameLower.startsWith(queryLower) && !aNameLower.startsWith(queryLower)) return 1;
        
        return a.name.localeCompare(b.name);
      });
      
      setResults(combinedResults);
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error);
      setResults([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [filterType, setIsSearching]);

  const filteredResults = filterType === 'all' 
    ? results 
    : results.filter(item => item.type === filterType);

  const movieResults = results.filter(item => item.type === 'movie');
  const seriesResults = results.filter(item => item.type === 'series');

  const updateTypeFilter = (type: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    router.push(url.pathname + url.search);
  };

  const placeholderImage = 'https://placehold.co/300x450?text=Sem+Imagem';

  return (
    <main className="min-h-screen bg-black text-white p-8 pt-24">
      <h1 className="text-4xl font-bold mb-4">Resultados para "{query}"</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">Nenhum resultado encontrado para "{query}"</p>
          <p className="text-gray-500 mt-2">Tente buscar por outro termo ou verifique a ortografia.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-400">{results.length} resultados encontrados</p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => updateTypeFilter('all')}
                className={`px-4 py-2 rounded-full transition-colors ${
                  filterType === 'all' 
                    ? 'bg-gray-100 text-black font-medium' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Todos ({results.length})
              </button>
              <button 
                onClick={() => updateTypeFilter('movie')}
                className={`px-4 py-2 rounded-full transition-colors ${
                  filterType === 'movie' 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Filmes ({movieResults.length})
              </button>
              <button 
                onClick={() => updateTypeFilter('series')}
                className={`px-4 py-2 rounded-full transition-colors ${
                  filterType === 'series' 
                    ? 'bg-red-600 text-white font-medium' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Séries ({seriesResults.length})
              </button>
            </div>
          </div>
          
          {filterType === 'all' ? (
            <>
              {movieResults.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold mr-2">
                      Filmes
                    </span>
                    <span>{movieResults.length} encontrados</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {movieResults.slice(0, 12).map((movie) => (
                      <ResultCard key={`movie-${movie.stream_id}`} item={movie} placeholderImage={placeholderImage} />
                    ))}
                  </div>
                  {movieResults.length > 12 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => updateTypeFilter('movie')}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Ver todos os {movieResults.length} filmes →
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {seriesResults.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold mr-2">
                      Séries
                    </span>
                    <span>{seriesResults.length} encontradas</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {seriesResults.slice(0, 12).map((series) => (
                      <ResultCard key={`series-${series.series_id}`} item={series} placeholderImage={placeholderImage} />
                    ))}
                  </div>
                  {seriesResults.length > 12 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => updateTypeFilter('series')}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Ver todas as {seriesResults.length} séries →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredResults.map((item) => (
                <ResultCard 
                  key={item.type === 'movie' ? `movie-${item.stream_id}` : `series-${item.series_id}`} 
                  item={item} 
                  placeholderImage={placeholderImage} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function ResultCard({ item, placeholderImage }: { item: SearchResult, placeholderImage: string }) {
  return (
    <Link 
      href={item.type === 'movie' ? `/?movie=${item.stream_id}` : `/series?series=${item.series_id}`}
      className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg"
    >
      <div className="aspect-[2/3] relative">
        <img 
          src={item.type === 'movie' ? item.stream_icon : item.cover || placeholderImage} 
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = placeholderImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
          <div className="p-3">
            {item.rating && (
              <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded text-xs font-bold inline-block mb-1">
                ★ {item.rating}
              </span>
            )}
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${item.type === 'movie' ? 'bg-blue-600' : 'bg-red-600'}`}>
              {item.type === 'movie' ? 'Filme' : 'Série'}
            </span>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
        {item.genre && (
          <p className="text-xs text-gray-400 mt-1">{item.genre}</p>
        )}
      </div>
    </Link>
  );
} 