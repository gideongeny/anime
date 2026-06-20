/**
 * TMDB API Service
 * Used for high-quality images and broader content discovery.
 */
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'; // Public demo key, rarely rate limited

class TMDBAPI {

    static getImageUrl(path, size = 'original') {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }

    // Search to map MAL -> TMDB
    static async search(query, year) {
        try {
            const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            const data = await res.json();

            // Filter for animation
            // Genre ID 16 is Animation
            const result = data.results.find(item =>
                (item.genre_ids && item.genre_ids.includes(16)) ||
                (item.media_type === 'tv' || item.media_type === 'movie')
            );
            return result;
        } catch (e) {
            console.error("TMDB Search Error", e);
            return null;
        }
    }

    // Get TV Details
    static async getTvDetails(id) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching TV details:', error);
            return null;
        }
    }

    // Get TV Season Episodes
    static async getTvSeasonEpisodes(id, seasonNumber = 1) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
            const data = await response.json();
            return data.episodes || [];
        } catch (error) {
            console.error('Error fetching TV season episodes:', error);
            return [];
        }
    }

    // Get Trending Animation (to flood the site)
    static async getTrendingAnime(page = 1) {
        try {
            // Genre 16 = Animation, original_language = ja (Japanese) for Anime
            const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
            const res = await fetch(url);
            const data = await res.json();
            return data.results;
        } catch (e) { return []; }
    }

    static async getPopularAnime(page = 1) {
        try {
            const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
            const res = await fetch(url);
            const data = await res.json();
            return data.results;
        } catch (e) { return []; }
    }

    static async getRecentAnime(page = 1) {
        try {
            // Currently airing or recently added
            const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=first_air_date.desc&page=${page}`;
            const res = await fetch(url);
            const data = await res.json();
            return data.results;
        } catch (e) { return []; }
    }

    static async getAnimeByGenre(genreId, page = 1) {
        try {
            const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16,${genreId}&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
            const res = await fetch(url);
            const data = await res.json();
            return data.results;
        } catch (e) { return []; }
    }

    static async discoverAnime(query, page = 1) {
        try {
            if (query) {
                const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
                const res = await fetch(url);
                const data = await res.json();
                // Filter to ensure we mostly get animation/anime related stuff
                return data.results.filter(item => 
                    (item.genre_ids && item.genre_ids.includes(16)) || 
                    item.original_language === 'ja'
                );
            } else {
                return await this.getPopularAnime(page);
            }
        } catch (e) { return []; }
    }

    static async getRecommendations(tmdbId, type = 'tv') {
        try {
            const url = `${TMDB_BASE_URL}/${type}/${tmdbId}/recommendations?api_key=${TMDB_API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            return data.results;
        } catch (e) { return []; }
    }

    // Get detailed info (including seasons/episodes)
    static async getDetails(tmdbId, type = 'tv') {
        try {
            const url = `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`;
            const res = await fetch(url);
            return await res.json();
        } catch (e) { return null; }
    }
}

window.TmdbAPI = TMDBAPI;
window.TMDBAPI = TMDBAPI; // Keep legacy just in case
