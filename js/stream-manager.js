/**
 * Stream Manager — Vidking ONLY (Clean Single Source)
 */
class StreamManager {
    static async getStreams(animeId, episodeNumber, type, tmdbId, season) {
        season = season || 1;
        if (tmdbId) {
            if (type === 'Movie' || type === 'movie') {
                return [{ server: 'Vidking', type: 'iframe', url: 'https://vidlink.pro/movie/' + tmdbId, is_default: true, icon: 'fa-play-circle' }];
            }
            return [{ server: 'Vidking', type: 'iframe', url: 'https://vidlink.pro/tv/' + tmdbId + '/' + season + '/' + episodeNumber, is_default: true, icon: 'fa-play-circle' }];
        }
        return [{ server: 'Vidking', type: 'iframe', url: 'https://vidlink.pro/tv/' + animeId + '/' + season + '/' + episodeNumber, is_default: true, icon: 'fa-play-circle' }];
    }
}
window.StreamManager = StreamManager;
