'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiUrl } from '../../config/xtream';
import Loading from '../components/Loading';
import VideoPlayer from '../components/VideoPlayer';

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
    stream_type?: string;
    episodes?: Episode[];
}

interface Episode {
    id: string;
    episode_num: number;
    title: string;
    container_extension: string;
    info?: {
        movie_image?: string;
        plot?: string;
        releasedate?: string;
    };
    season?: number;
}

export default function SeriesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const seriesId = searchParams.get('series');
    const episodeId = searchParams.get('episode');
    const seasonParam = searchParams.get('season');
    
    const [loading, setLoading] = useState(true);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    const [allSeries, setAllSeries] = useState<Series[]>([]);
    const [displayedSeries, setDisplayedSeries] = useState<Series[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    const [seasons, setSeasons] = useState<number[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const seriesPerPage = 24;

    // Função para atualizar a URL
    const updateUrl = useCallback((params: { series?: string; season?: string; episode?: string }) => {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });
        router.push(url.pathname + url.search);
    }, [router]);

    // Buscar todas as séries
    useEffect(() => {
        const fetchAllSeries = async () => {
            try {
                const response = await axios.get(getApiUrl('get_series'));
                if (response.data && Array.isArray(response.data)) {
                    setAllSeries(response.data);
                    setDisplayedSeries(response.data.slice(0, seriesPerPage));

                    if (seriesId) {
                        const series = response.data.find((s: Series) => s.series_id.toString() === seriesId);
                        if (series) {
                            setSelectedSeries({
                                ...series,
                                stream_type: 'series'
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar séries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllSeries();
    }, [seriesId]);

    // Carregar mais séries
    const loadMoreSeries = useCallback(() => {
        if (loadingMore || displayedSeries.length >= allSeries.length) return;
        
        setLoadingMore(true);
        const nextPage = page + 1;
        const startIndex = (nextPage - 1) * seriesPerPage;
        const endIndex = nextPage * seriesPerPage;
        
        setDisplayedSeries(prev => [...prev, ...allSeries.slice(startIndex, endIndex)]);
        setPage(nextPage);
        setLoadingMore(false);
    }, [allSeries, displayedSeries.length, loadingMore, page, seriesPerPage]);

    // Detectar scroll para carregar mais séries
    useEffect(() => {
        if (selectedSeries) return;

        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
                loadMoreSeries();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMoreSeries, selectedSeries]);

    // Buscar episódios quando uma série é selecionada
    useEffect(() => {
        const fetchEpisodes = async () => {
            if (!selectedSeries) return;

            setLoadingEpisodes(true);
            try {
                const response = await axios.get(`${getApiUrl('get_series_info')}&series_id=${selectedSeries.series_id}`);
                
                if (response.data && response.data.episodes) {
                    let processedEpisodes: Episode[] = [];
                    
                    if (Array.isArray(response.data.episodes)) {
                        processedEpisodes = response.data.episodes.map((ep: any) => ({
                            ...ep,
                            season: ep.season || 1
                        }));
                    } else if (typeof response.data.episodes === 'object') {
                        Object.entries(response.data.episodes).forEach(([season, episodes]: [string, any]) => {
                            if (Array.isArray(episodes)) {
                                processedEpisodes.push(...episodes.map((ep: any) => ({
                                    ...ep,
                                    season: parseInt(season)
                                })));
                            }
                        });
                    }

                    processedEpisodes.sort((a, b) => {
                        if (a.season !== b.season) {
                            return (a.season || 1) - (b.season || 1);
                        }
                        return a.episode_num - b.episode_num;
                    });

                    setEpisodes(processedEpisodes);

                    const uniqueSeasons = [...new Set(processedEpisodes.map(ep => ep.season || 1))].sort((a, b) => a - b);
                    setSeasons(uniqueSeasons);

                    const initialSeason = seasonParam ? parseInt(seasonParam) : uniqueSeasons[0] || 1;
                    setSelectedSeason(initialSeason);

                    if (episodeId) {
                        const episode = processedEpisodes.find(ep => ep.id === episodeId);
                        if (episode) {
                            setSelectedEpisode(episode);
                            setSelectedSeason(episode.season || 1);
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar episódios:', error);
            } finally {
                setLoadingEpisodes(false);
            }
        };

        fetchEpisodes();
    }, [selectedSeries, seasonParam, episodeId]);

    const seasonEpisodes = episodes.filter(ep => (ep.season || 1) === selectedSeason);

    const handleSeasonChange = (season: number) => {
        setSelectedSeason(season);
        setSelectedEpisode(null);
        updateUrl({
            series: seriesId || undefined,
            season: season.toString()
        });
    };

    const handleEpisodeSelect = (episode: Episode) => {
        setSelectedEpisode(episode);
        updateUrl({
            series: seriesId || undefined,
            season: selectedSeason.toString(),
            episode: episode.id
        });
    };

    const handleSeriesSelect = (series: Series) => {
        setSelectedSeries({
            ...series,
            stream_type: 'series'
        });
        updateUrl({ series: series.series_id.toString() });
    };

    const handleClosePlayer = () => {
        setSelectedEpisode(null);
        updateUrl({
            series: seriesId || undefined,
            season: selectedSeason.toString()
        });
    };

    if (loading) {
        return <Loading />;
    }

    if (selectedEpisode) {
        const episodeForPlayer = {
            ...selectedEpisode,
            stream_id: parseInt(selectedEpisode.id),
            stream_type: 'series',
            name: `${selectedSeries?.name} - Temporada ${selectedEpisode.season} Episódio ${selectedEpisode.episode_num}`,
            stream_icon: selectedEpisode.info?.movie_image || selectedSeries?.cover
        };
        
        return <VideoPlayer movie={episodeForPlayer} onClose={handleClosePlayer} />;
    }

    if (!selectedSeries) {
        return (
            <main className="min-h-screen bg-black text-white p-8">
                <h1 className="text-4xl font-bold mb-8">Séries</h1>
                
                {displayedSeries.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-400">Nenhuma série encontrada</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {displayedSeries.map((series) => (
                                <div
                                    key={series.series_id}
                                    onClick={() => handleSeriesSelect(series)}
                                    className="netflix-card"
                                >
                                    <div className="aspect-[2/3] relative">
                                        <img 
                                            src={series.cover} 
                                            alt={series.name}
                                            className="w-full h-full object-cover rounded-lg"
                                            loading="lazy"
                                        />
                                        <div className="netflix-card-info rounded-lg p-4">
                                            <h3 className="font-bold text-white text-sm md:text-base line-clamp-2 mb-1">
                                                {series.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {series.rating && (
                                                    <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded text-xs font-bold">
                                                        ★ {series.rating}
                                                    </span>
                                                )}
                                                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                                                    Série
                                                </span>
                                            </div>
                                            {series.genre && (
                                                <p className="text-xs text-gray-300 line-clamp-2">{series.genre}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {loadingMore && (
                            <div className="flex justify-center py-8">
                                <Loading />
                            </div>
                        )}
                    </>
                )}
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="relative">
                {/* Header com backdrop e informações da série */}
                <div 
                    className="relative h-[50vh] bg-cover bg-center"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.9)), url(${selectedSeries.backdrop_path || selectedSeries.cover})`
                    }}
                >
                    <div className="absolute top-4 left-4">
                        <button 
                            onClick={() => {
                                setSelectedSeries(null);
                                updateUrl({});
                            }}
                            className="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full flex items-center transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Voltar
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                        <div className="flex items-end gap-8">
                            <img 
                                src={selectedSeries.cover} 
                                alt={selectedSeries.name}
                                className="w-40 h-60 object-cover rounded-lg shadow-2xl"
                            />
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold mb-2">{selectedSeries.name}</h1>
                                <div className="flex items-center gap-4 mb-4">
                                    {selectedSeries.rating && (
                                        <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                                            ★ {selectedSeries.rating}
                                        </span>
                                    )}
                                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                                        Série
                                    </span>
                                    {selectedSeries.genre && (
                                        <span className="text-gray-300">{selectedSeries.genre}</span>
                                    )}
                                </div>
                                {selectedSeries.plot && (
                                    <p className="text-gray-400 max-w-3xl">{selectedSeries.plot}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seletor de temporadas e lista de episódios */}
                <div className="p-8">
                    {loadingEpisodes ? (
                        <div className="flex justify-center py-12">
                            <Loading />
                        </div>
                    ) : seasons.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-400">Nenhum episódio encontrado</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center mb-8 overflow-x-auto pb-2">
                                <h2 className="text-2xl font-bold mr-6">Temporadas:</h2>
                                <div className="flex gap-2">
                                    {seasons.map(season => (
                                        <button
                                            key={season}
                                            onClick={() => handleSeasonChange(season)}
                                            className={`px-4 py-2 rounded-full transition-colors ${
                                                selectedSeason === season 
                                                    ? 'bg-red-600 text-white' 
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            Temporada {season}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {seasonEpisodes.map((episode) => (
                                    <div
                                        key={episode.id}
                                        onClick={() => handleEpisodeSelect(episode)}
                                        className="bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer hover:bg-gray-900/70 transition-colors"
                                    >
                                        <div className="aspect-video relative">
                                            {episode.info?.movie_image && (
                                                <img 
                                                    src={episode.info.movie_image}
                                                    alt={episode.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <div className="bg-white/20 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-red-600 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg mb-1">
                                                Episódio {episode.episode_num}
                                            </h3>
                                            <p className="text-gray-400">{episode.title}</p>
                                            {episode.info?.plot && (
                                                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                                    {episode.info.plot}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
} 