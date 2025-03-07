'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiUrl } from '../../config/xtream';
import Loading from '../components/Loading';
import VideoPlayer from '../components/VideoPlayer';

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

export default function FilmesPage() {
    const router = useRouter();
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const moviesPerPage = 24;

    // Função para buscar todos os filmes
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(getApiUrl('get_vod_streams'));
                if (response.data && Array.isArray(response.data)) {
                    const movies = response.data;
                    setAllMovies(movies);
                    
                    // Inicialmente, mostrar apenas os primeiros filmes
                    setDisplayedMovies(movies.slice(0, moviesPerPage));
                } else {
                    console.error('Formato de resposta inválido:', response.data);
                    setAllMovies([]);
                    setDisplayedMovies([]);
                }
            } catch (error) {
                console.error('Erro ao buscar filmes:', error);
                setAllMovies([]);
                setDisplayedMovies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // Função para carregar mais filmes
    const loadMoreMovies = useCallback(() => {
        if (loadingMore || displayedMovies.length >= allMovies.length) return;
        
        setLoadingMore(true);
        const nextPage = page + 1;
        const startIndex = (nextPage - 1) * moviesPerPage;
        const endIndex = nextPage * moviesPerPage;
        
        setTimeout(() => {
            setDisplayedMovies(prev => [
                ...prev,
                ...allMovies.slice(startIndex, endIndex)
            ]);
            setPage(nextPage);
            setLoadingMore(false);
        }, 500); // Pequeno delay para mostrar o loading
    }, [allMovies, displayedMovies.length, loadingMore, page, moviesPerPage]);

    // Detectar quando o usuário rola até o final da página
    useEffect(() => {
        if (selectedMovie) return; // Não carregar mais filmes quando um filme estiver selecionado
        
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
                loadMoreMovies();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMoreMovies, selectedMovie]);

    // Função para fechar o player de vídeo
    const handleClosePlayer = () => {
        setSelectedMovie(null);
    };

    // Função para selecionar um filme
    const handleSelectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
    };

    if (loading) {
        return <Loading />;
    }

    if (selectedMovie) {
        return <VideoPlayer movie={selectedMovie} onClose={handleClosePlayer} />;
    }

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            <div className="container mx-auto px-4 py-8 pt-24">
                <h1 className="text-4xl font-bold mb-8">Filmes</h1>
                
                {displayedMovies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-xl text-gray-400 mb-4">Nenhum filme encontrado</p>
                        <button 
                            onClick={() => router.push('/')}
                            className="px-6 py-2 bg-[#e50914] text-white rounded hover:bg-opacity-80 transition"
                        >
                            Voltar para o início
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                        
                        {loadingMore && (
                            <div className="flex justify-center py-8">
                                <Loading />
                            </div>
                        )}
                        
                        {!loadingMore && displayedMovies.length < allMovies.length && (
                            <div className="flex justify-center mt-8">
                                <button 
                                    onClick={loadMoreMovies}
                                    className="bg-[#e50914] hover:bg-opacity-80 text-white px-6 py-2 rounded transition-colors"
                                >
                                    Carregar mais filmes
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 