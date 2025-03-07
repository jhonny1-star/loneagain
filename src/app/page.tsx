'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl, getStreamUrl } from '../config/xtream';
import ReactPlayer from 'react-player';

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
}

export default function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(getApiUrl('get_vod_streams'));
                setMovies(response.data);
            } catch (error) {
                console.error('Erro ao buscar filmes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold mb-8">Filmes e Séries</h1>
            
            {selectedMovie ? (
                <div className="mb-8">
                    <button 
                        onClick={() => setSelectedMovie(null)}
                        className="mb-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Voltar para a lista
                    </button>
                    <div className="aspect-video w-full max-w-4xl mx-auto">
                        <ReactPlayer
                            url={getStreamUrl(selectedMovie.stream_id.toString(), 'movie')}
                            controls
                            width="100%"
                            height="100%"
                        />
                    </div>
                    <h2 className="text-2xl font-bold mt-4">{selectedMovie.name}</h2>
                    <p className="text-gray-400">Avaliação: {selectedMovie.rating}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center">Carregando...</div>
                    ) : (
                        movies.map((movie) => (
                            <div 
                                key={movie.stream_id}
                                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:transform hover:scale-105 transition-transform"
                                onClick={() => setSelectedMovie(movie)}
                            >
                                <img 
                                    src={movie.stream_icon} 
                                    alt={movie.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold">{movie.name}</h3>
                                    <p className="text-sm text-gray-400">Avaliação: {movie.rating}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </main>
    );
} 