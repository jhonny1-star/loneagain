'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';
import { getStreamUrl } from '../../config/xtream';

interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    movie_image: string;
    plot: string;
  };
}

interface Movie {
  stream_id: number;
  stream_icon?: string;
  name: string;
  stream_type?: string;
  episodes?: Episode[];
  info?: {
    movie_image?: string;
    plot?: string;
  };
}

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
}

export default function VideoPlayer({ movie, onClose }: VideoPlayerProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showEpisodes, setShowEpisodes] = useState(false);

  if (!movie || !movie.stream_id) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#141414]">
        <div className="text-center p-8">
          <h2 className="text-2xl text-white mb-4">Vídeo não disponível</h2>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#e50914] text-white rounded hover:bg-opacity-80 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Verificar se estamos no lado do cliente
  useEffect(() => {
    setIsClient(true);
    // Se for série, selecionar primeiro episódio por padrão
    if (movie.stream_type === 'series' && movie.episodes && movie.episodes.length > 0) {
      setSelectedEpisode(movie.episodes[0]);
      setShowEpisodes(true);
    }
  }, [movie]);

  useEffect(() => {
    // Só inicializar o player se estivermos no cliente
    if (!isClient) return;

    // Certifique-se de que temos referências válidas
    if (!videoRef.current) return;

    // Limpar player anterior se existir
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Resetar estados de erro
    setError(false);
    setErrorCode(null);

    // Gerar URL do stream
    let streamUrl = '';
    if (movie.stream_type === 'series' && selectedEpisode) {
      const streamData = getStreamUrl(selectedEpisode.id, 'series');
      streamUrl = streamData.mp4;
    } else {
      const streamData = getStreamUrl(movie.stream_id.toString(), 'movie');
      streamUrl = streamData.mp4;
    }
    
    console.log('Stream URL:', streamUrl); // Debug

    // Inicializar o player diretamente sem verificar a URL
    initializePlayer(streamUrl);

  }, [movie.stream_id, selectedEpisode, isClient]);

  const initializePlayer = (streamUrl: string) => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    const player = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      fill: true,
      aspectRatio: '16:9',
      sources: [{
        src: streamUrl,
        type: 'video/mp4'
      }],
      poster: movie.stream_type === 'series' && selectedEpisode 
        ? selectedEpisode.info?.movie_image 
        : movie.stream_icon,
      playbackRates: [0.5, 1, 1.5, 2],
      userActions: {
        hotkeys: true
      },
      controlBar: {
        pictureInPictureToggle: true,
        fullscreenToggle: true
      }
    });

    // Adicionar classe personalizada para remover bordas pretas
    player.addClass('vjs-fill-window');
    
    // Definir o fundo do player como preto
    const playerElement = player.el();
    if (playerElement) {
      (playerElement as HTMLElement).style.backgroundColor = 'black';
    }

    // Configurar manipuladores de eventos
    player.on('error', () => {
      const errorCode = player.error()?.code || 0;
      console.error('Erro do player:', player.error());
      setError(true);
      setErrorCode(errorCode);
    });

    // Ajustar o tamanho do vídeo para preencher o contêiner
    player.on('loadedmetadata', () => {
      player.fill(true);
      player.fluid(true);
      
      // Ajustar o modo de exibição do vídeo
      const videoEl = player.tech().el();
      if (videoEl) {
        (videoEl as HTMLElement).style.objectFit = 'contain';
      }
    });

    playerRef.current = player;
  };

  const retryPlayback = () => {
    if (!isClient || !videoRef.current) return;

    // Resetar estados de erro
    setError(false);
    setErrorCode(null);

    // Limpar player anterior se existir
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Gerar URL do stream
    let streamUrl = '';
    if (movie.stream_type === 'series' && selectedEpisode) {
      const streamData = getStreamUrl(selectedEpisode.id, 'series');
      streamUrl = streamData.mp4;
    } else {
      const streamData = getStreamUrl(movie.stream_id.toString(), 'movie');
      streamUrl = streamData.mp4;
    }

    // Tentar inicializar o player novamente
    initializePlayer(streamUrl);
  };

  // Função para obter mensagens de erro baseadas no código
  const getErrorTips = () => {
    if (!errorCode) return 'Ocorreu um erro desconhecido durante a reprodução.';

    switch (errorCode) {
      case 1:
        return 'O formato de vídeo não é suportado pelo seu navegador.';
      case 2:
        return 'Erro de rede: verifique sua conexão com a internet.';
      case 3:
        return 'O vídeo pode estar corrompido ou em um formato não suportado.';
      case 4:
        return 'O vídeo não está disponível no momento. Tente novamente mais tarde.';
      case 5:
        return 'O vídeo foi interrompido devido a um problema de codificação.';
      default:
        return 'Ocorreu um erro durante a reprodução. Tente novamente.';
    }
  };

  // Renderização condicional para o player
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#141414]">
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full flex items-center transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>
          {movie.stream_type === 'series' && (
            <button
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full flex items-center transition-all"
            >
              {showEpisodes ? 'Ocultar Episódios' : 'Mostrar Episódios'}
            </button>
          )}
        </div>
        
        <div className="flex gap-4">
          <div className={`${showEpisodes ? 'w-3/4' : 'w-full'}`}>
            {error ? (
              <div className="flex flex-col items-center justify-center w-full h-[60vh] text-white p-4 bg-black/90 rounded-lg">
                <div className="mb-4 text-2xl font-bold text-red-500">Erro de Reprodução</div>
                <p className="mb-6 text-center">{getErrorTips()}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={retryPlayback}
                    className="px-4 py-2 bg-[#e50914] text-white rounded hover:bg-opacity-80 transition-colors"
                  >
                    Tentar novamente
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Voltar à lista
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl" style={{ maxHeight: '60vh' }}>
                {isClient ? (
                  <div data-vjs-player className="w-full h-full video-container">
                    <video
                      ref={videoRef}
                      className="video-js vjs-big-play-centered vjs-theme-netflix vjs-fill-window"
                      playsInline
                    />
                  </div>
                ) : (
                  movie.stream_icon && (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <img 
                        src={movie.stream_icon} 
                        alt="Carregando player..." 
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute text-white">Carregando player...</div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {showEpisodes && movie.episodes && (
            <div className="w-1/4 bg-black/90 rounded-lg p-4 overflow-y-auto max-h-[60vh]">
              <h3 className="text-white text-xl font-bold mb-4">Episódios</h3>
              <div className="space-y-2">
                {movie.episodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={() => setSelectedEpisode(episode)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      selectedEpisode?.id === episode.id
                        ? 'bg-[#e50914] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-bold">Episódio {episode.episode_num}</div>
                    <div className="text-sm truncate">{episode.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 