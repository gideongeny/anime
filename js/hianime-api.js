/**
 * HiAnime API Service + TMDB Schedule fallback
 */
const HIANIME_INSTANCES = [
    'https://hianime-api-six.vercel.app',
    'https://animeapi.iscoolapp.me'
];

const TMDB_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const TMDB_BASE = 'https://api.themoviedb.org/3';

class HiAnimeAPI {

    static async tryFetch(path) {
        for (const base of HIANIME_INSTANCES) {
            try {
                const res = await fetch(base + path, { signal: AbortSignal.timeout(4000) });
                if (res.ok) return await res.json();
            } catch (e) { /* try next */ }
        }
        return null;
    }

    static async getSchedule(date) {
        // Try HiAnime first
        const data = await this.tryFetch(`/api/schedule?date=${date}`);
        if (data && data.results) return data.results;

        // Fallback: TMDB airing today with animation genre
        try {
            const url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_genres=16&with_original_language=ja&air_date.gte=${date}&air_date.lte=${date}&sort_by=popularity.desc`;
            const res = await fetch(url);
            const json = await res.json();
            return (json.results || []).map(a => ({
                id: String(a.id),
                title: a.name || a.title,
                japanese_title: a.original_name || '',
                time: '00:00',
                episode_no: '?',
                poster: a.poster_path ? `https://image.tmdb.org/t/p/w185${a.poster_path}` : null,
                tmdb: true
            }));
        } catch (e) { return []; }
    }

    static async search(keyword) {
        const data = await this.tryFetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
        if (data && data.results) return data.results;
        return [];
    }

    static async getTopAiring() {
        const data = await this.tryFetch('/api/most-popular?page=1');
        if (data && data.results && data.results.data) return data.results.data;
        return [];
    }
}

window.HiAnimeAPI = HiAnimeAPI;
