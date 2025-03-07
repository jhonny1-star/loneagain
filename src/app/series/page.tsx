'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config/xtream';
import ReactPlayer from 'react-player';

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
}

interface Episode {
    id: string;
    episode_num: number;
    title: string;
    container_extension: string;
    info: {
        movie_image: string;
        plot: string;
        duration_secs: string;
    };
}

export default function SeriesPage() {
    const [series, setSeries] = useState<Series[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const response = await axios.get(getApiUrl('get_series'));
                setSeries(response.data);
            } catch (error) {
                console.error('Erro ao buscar séries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
    }, []);

    useEffect(() => {
        const fetchEpisodes = async () => {
            if (selectedSeries) {
                try {
                    const response = await axios.get(
                        getApiUrl(`get_series_info&series_id=${selectedSeries.series_id}`)
                    );
                    setEpisodes(response.data.episodes);
                } catch (error) {
                    console.error('Erro ao buscar episódios:', error);
                }
            }
        };

        fetchEpisodes();
    }, [selectedSeries]);

    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold mb-8">Séries</h1>
            
            {selectedEpisode ? (
                <div className="mb-8">
                    <button 
                        onClick={() => setSelectedEpisode(null)}
                        className="mb-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Voltar para os episódios
                    </button>
                    <div className="aspect-video w-full max-w-4xl mx-auto">
                        <ReactPlayer
                            url={`${getApiUrl('get_live_streams')}/${selectedEpisode.id}.m3u8`}
                            controls
                            width="100%"
                            height="100%"
                        />
                    </div>
                    <h2 className="text-2xl font-bold mt-4">
                        {selectedSeries?.name} - Episódio {selectedEpisode.episode_num}
                    </h2>
                    <p className="text-gray-400">{selectedEpisode.title}</p>
                </div>
            ) : selectedSeries ? (
                <div>
                    <button 
                        onClick={() => setSelectedSeries(null)}
                        className="mb-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Voltar para a lista de séries
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {episodes.map((episode) => (
                            <div 
                                key={episode.id}
                                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:transform hover:scale-105 transition-transform"
                                onClick={() => setSelectedEpisode(episode)}
                            >
                                <img 
                                    src={episode.info.movie_image} 
                                    alt={`Episódio ${episode.episode_num}`}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold">Episódio {episode.episode_num}</h3>
                                    <p className="text-sm text-gray-400">{episode.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center">Carregando...</div>
                    ) : (
                        series.map((serie) => (
                            <div 
                                key={serie.series_id}
                                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:transform hover:scale-105 transition-transform"
                                onClick={() => setSelectedSeries(serie)}
                            >
                                <img 
                                    src={serie.cover} 
                                    alt={serie.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold">{serie.name}</h3>
                                    <p className="text-sm text-gray-400">Gênero: {serie.genre}</p>
                                    <p className="text-sm text-gray-400">Avaliação: {serie.rating}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </main>
    );
} 