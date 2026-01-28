/**
 * Anime API Service using Jikan API (v4)
 * Documentation: https://docs.api.jikan.moe/
 */

const API_BASE_URL = 'https://api.jikan.moe/v4';

class AnimeAPI {

    // Fetch Top Anime (Trending/Popular)
    static async getTopAnime(filter = 'airing', limit = 6) {
        try {
            const response = await fetch(`${API_BASE_URL}/top/anime?filter=${filter}&limit=${limit}`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching top anime:', error);
            // Fallback mock data if API fails (rate limits)
            return this.getMockData();
        }
    }

    // Fetch Recent Episodes (Simulated "Recently Added")
    static async getRecentEpisodes(limit = 6) {
        try {
            const response = await fetch(`${API_BASE_URL}/seasons/now?limit=${limit}`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching recent anime:', error);
            return [];
        }
    }

    // Get Anime Details by ID
    static async getAnimeDetails(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/anime/${id}`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching details:', error);
            return null;
        }
    }

    // Get Recommendations/Related (for "You might like")
    static async getRecommendations(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/recommendations`);
            const data = await response.json();
            return data.data.slice(0, 4); // limit to 4
        } catch (error) {
            return [];
        }
    }

    // Search Anime with Pagination
    static async searchAnime(query, page = 1) {
        try {
            const url = query
                ? `${API_BASE_URL}/anime?q=${query}&page=${page}&limit=18`
                : `${API_BASE_URL}/top/anime?page=${page}&limit=18`;

            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching anime:', error);
            return { data: [], pagination: { has_next_page: false } };
        }
    }

    // Get External Links (for Streaming)
    static async getAnimeExternalLinks(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/external`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching external links:', error);
            return [];
        }
    }

    // Get Characters
    static async getAnimeCharacters(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/characters`);
            const data = await response.json();
            return data.data.slice(0, 6); // Limit to main cast
        } catch (error) {
            return [];
        }
    }

    // Get Episodes
    static async getAnimeEpisodes(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/anime/${id}/episodes`);
            const data = await response.json();
            return data.data; // List of episodes
        } catch (error) {
            console.error('Error fetching episodes:', error);
            return [];
        }
    }

    // Mock Data for fallback
    static getMockData() {
        return [
            {
                mal_id: 1,
                title: "Cowboy Bebop",
                images: { jpg: { large_image_url: "img/trending/trend-1.jpg" } },
                score: 8.75,
                status: "Finished Airing",
                type: "TV",
                episodes: 26
            },
            // ... more items can be added
        ];
    }
}

// Export specific to global scope for this simple setup
window.AnimeAPI = AnimeAPI;
