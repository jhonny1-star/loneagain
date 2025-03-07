interface ApiConfig {
    username: string;
    password: string;
    baseUrl: string;
}

const config: ApiConfig = {
    username: 'Tourobox1-DRu27Kimwe',
    password: 'tHfObFIl42',
    baseUrl: 'http://tyrti.shop'
};

export function getApiUrl(action: string, params?: any): string {
    const baseUrl = `${config.baseUrl}/player_api.php`;
    const authParams = `username=${config.username}&password=${config.password}`;
    
    if (action === 'get_series_info' && params) {
        return `${baseUrl}?${authParams}&action=${action}&series_id=${params}`;
    }
    
    return `${baseUrl}?${authParams}&action=${action}`;
}

export function getStreamUrl(id: string, type: 'movie' | 'series'): { mp4: string } {
    const streamType = type === 'movie' ? 'movie' : 'series';
    const mp4Url = `${config.baseUrl}/${streamType}/${config.username}/${config.password}/${id}.mp4`;
    
    console.log(`Gerando URL para ${type} ID ${id}: ${mp4Url}`);
    
    return {
        mp4: mp4Url
    };
} 