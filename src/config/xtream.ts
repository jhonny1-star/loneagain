export const XTREAM_CONFIG = {
    baseURL: 'http://hambu.xgoapp.xyz',
    username: 'ryan01',
    password: 'dantas',
    apiPath: '/player_api.php'
};

export const getStreamUrl = (streamId: string, streamType: 'movie' | 'series') => {
    return `${XTREAM_CONFIG.baseURL}/live/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.m3u8`;
};

export const getApiUrl = (action: string) => {
    return `${XTREAM_CONFIG.baseURL}${XTREAM_CONFIG.apiPath}?username=${XTREAM_CONFIG.username}&password=${XTREAM_CONFIG.password}&action=${action}`;
}; 