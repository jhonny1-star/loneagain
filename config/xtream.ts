export const XTREAM_CONFIG = {
    baseURL: 'http://tyrti.shop/',
    username: 'Tourobox1-DRu27Kimwe',
    password: 'tHfObFIl42',
    apiPath: '/player_api.php'
};

// Função para obter a URL de streaming com formato MP4
export const getStreamUrl = (streamId: string, streamType: 'movie' | 'series') => {
    let url = '';
    
    if (streamType === 'movie') {
        // Formato para filmes (VOD)
        url = `${XTREAM_CONFIG.baseURL}/movie/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.mp4`;
    } else if (streamType === 'series') {
        // Formato para episódios de séries
        url = `${XTREAM_CONFIG.baseURL}/series/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.mp4`;
    } else {
        // Formato para transmissões ao vivo (não usado atualmente)
        url = `${XTREAM_CONFIG.baseURL}/live/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.mp4`;
    }
    
    console.log(`Gerando URL para ${streamType} ID ${streamId}: ${url}`);
    
    return {
        mp4: url
    };
};

export const getApiUrl = (action: string) => {
    return `${XTREAM_CONFIG.baseURL}${XTREAM_CONFIG.apiPath}?username=${XTREAM_CONFIG.username}&password=${XTREAM_CONFIG.password}&action=${action}`;
}; 