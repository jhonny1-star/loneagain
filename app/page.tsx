'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiUrl, getStreamUrl } from '../config/xtream';
import Image from 'next/image';
import Loading from './components/Loading';
import VideoPlayer from './components/VideoPlayer';

interface Movie {
    num: number;
    name: string;
    stream_type: string;
    stream_id: number;
    stream_icon: string;
    rating: string;
    added: string;
    category_id: string;
    container_extension: string;
    custom_sid: string;
    direct_source: string;
    plot?: string;
    genre?: string;
    releasedate?: string;
    backdrop_path?: string;
}

interface Series {
    num: number;
    name: string;
    series_id: number;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
    backdrop_path?: string;
}

export default function Home() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const movieId = searchParams.get('movie');
    
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
    const [series, setSeries] = useState<Series[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
    const moviesPerPage = 16;

    // Função para buscar todos os filmes
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(getApiUrl('get_vod_streams'));
                if (response.data && Array.isArray(response.data)) {
                    const movies = response.data;
                    setAllMovies(movies);
                    
                    // Selecionar um filme aleatório para o banner
                    const randomIndex = Math.floor(Math.random() * Math.min(20, movies.length));
                    setFeaturedMovie(movies[randomIndex]);
                    
                    // Inicialmente, mostrar apenas os primeiros 16 filmes
                    setDisplayedMovies(movies.slice(0, moviesPerPage));
                    
                    // Se houver um ID de filme na URL, selecione-o
                    if (movieId) {
                        const movie = movies.find((m: Movie) => m.stream_id.toString() === movieId);
                        if (movie) {
                            setSelectedMovie(movie);
                        }
                    }
                } else {
                    console.error('Formato de resposta inválido:', response.data);
                    setAllMovies([]);
                    setDisplayedMovies([]);
                }
            } catch (error) {
                console.error('Erro ao buscar filmes:', error);
                setAllMovies([]);
                setDisplayedMovies([]);
            }
        };

        const fetchSeries = async () => {
            try {
                const response = await axios.get(getApiUrl('get_series'));
                if (response.data && Array.isArray(response.data)) {
                    // Mostrar apenas as primeiras 16 séries
                    setSeries(response.data.slice(0, moviesPerPage));
                }
            } catch (error) {
                console.error('Erro ao buscar séries:', error);
                setSeries([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
        fetchSeries();
    }, [movieId]);

    // Função para fechar o player de vídeo
    const handleClosePlayer = () => {
        setSelectedMovie(null);
        // Remover o parâmetro movie da URL
        const url = new URL(window.location.href);
        url.searchParams.delete('movie');
        window.history.pushState({}, '', url);
    };

    // Função para selecionar um filme
    const handleSelectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
        // Adicionar o ID do filme à URL
        const url = new URL(window.location.href);
        url.searchParams.set('movie', movie.stream_id.toString());
        window.history.pushState({}, '', url);
    };

    // Função para navegar para a página de séries
    const handleNavigateToSeries = (series: Series) => {
        router.push(`/series?series=${series.series_id}`);
    };

    if (loading) {
        return <Loading />;
    }

    if (selectedMovie) {
        return <VideoPlayer movie={selectedMovie} onClose={handleClosePlayer} />;
    }

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            {/* Banner Principal */}
            {featuredMovie && (
                <div className="relative w-full h-[70vh] mb-8">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/20 to-[#141414] z-10"></div>
                    <div 
                        className="absolute inset-0 bg-cover bg-center" 
                        style={{ 
                            backgroundImage: `url(${featuredMovie.stream_icon})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top'
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="relative z-20 flex flex-col justify-end h-full p-8 md:p-16">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{featuredMovie.name}</h1>
                        {featuredMovie.plot && (
                            <p className="text-lg max-w-2xl mb-6 drop-shadow-md line-clamp-3">{featuredMovie.plot}</p>
                        )}
                        <div className="flex space-x-4">
                            <button 
                                onClick={() => handleSelectMovie(featuredMovie)}
                                className="px-6 py-2 bg-[#e50914] text-white rounded hover:bg-opacity-80 transition flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Assistir
                            </button>
                            <button className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-opacity-80 transition flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                </svg>
                                Mais Informações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Seção de Filmes */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Filmes em Destaque</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {displayedMovies.map((movie) => (
                        <div 
                            key={movie.stream_id} 
                            className="relative group cursor-pointer transition-transform duration-300 transform hover:scale-105"
                            onClick={() => handleSelectMovie(movie)}
                        >
                            <div className="aspect-[2/3] rounded-md overflow-hidden bg-gray-800">
                                {movie.stream_icon ? (
                                    <img 
                                        src={movie.stream_icon} 
                                        alt={movie.name} 
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-sm text-gray-400">{movie.name}</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button className="bg-white bg-opacity-30 rounded-full p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-200 truncate">{movie.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Seção de Séries */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Séries em Destaque</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {series.map((serie) => (
                        <div 
                            key={serie.series_id} 
                            className="relative group cursor-pointer transition-transform duration-300 transform hover:scale-105"
                            onClick={() => handleNavigateToSeries(serie)}
                        >
                            <div className="aspect-[2/3] rounded-md overflow-hidden bg-gray-800">
                                {serie.cover ? (
                                    <img 
                                        src={serie.cover} 
                                        alt={serie.name} 
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-sm text-gray-400">{serie.name}</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button className="bg-white bg-opacity-30 rounded-full p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-200 truncate">{serie.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
