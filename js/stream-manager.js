/**
 * Stream Manager Service
 * Handles fetching video sources.
 * In a real app, this would connect to a backend or a scraping API.
 */

class StreamManager {

    // Get streams for a specific episode
    static async getStreams(animeId, episodeNumber, type = 'TV') {
        console.log(`Fetching streams for Anime ${animeId} Ep ${episodeNumber} Type: ${type}`);

        const streams = [];

        // 1. KUROYAMA / NANI (Best for Anime - Uses MAL ID directly)
        // No IMDB mapping needed, high success rate for anime
        streams.push({
            server: "Nani (Best)",
            type: "iframe",
            url: `https://player.kurov.xyz/embed/${animeId}/${episodeNumber}`,
            is_default: true
        });

        // 2. VIDSTREAM / GOGO (Scraping Fallback via Anify/Consumet - if we had backend, but here using a proxy wrapper if available)
        // Instead, we will look for IMDB ID for standard convertors
        let imdbId = null;
        try {
            const links = await window.AnimeAPI.getAnimeExternalLinks(animeId);
            if (links) {
                const imdbLink = links.find(l => l.name === 'Official Site' && l.url.includes('imdb')) ||
                    links.find(l => l.url.includes('imdb'));

                if (imdbLink) {
                    const match = imdbLink.url.match(/tt\d+/);
                    if (match) imdbId = match[0];
                }
            }
        } catch (e) { console.log("IMDB Fetch Error", e); }

        if (imdbId) {
            // VidSrc - Handle Movie vs TV
            const isMovie = type && (type.toLowerCase() === 'movie' || type.toLowerCase() === 'special');

            if (isMovie) {
                streams.push({
                    server: "VidSrc (Movie)",
                    type: "iframe",
                    url: `https://vidsrc.xyz/embed/movie/${imdbId}`,
                    is_default: false
                });
                streams.push({
                    server: "SuperEmbed (Movie)",
                    type: "iframe",
                    url: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1`,
                    is_default: false
                });
            } else {
                // TV Show - Assume Season 1 (Detailed mapping requires simple-mal-sync which is heavy)
                streams.push({
                    server: "VidSrc (Season 1)",
                    type: "iframe",
                    url: `https://vidsrc.xyz/embed/tv/${imdbId}/1/${episodeNumber}`,
                    is_default: false
                });
                streams.push({
                    server: "2Embed (Reasonable)",
                    type: "iframe",
                    url: `https://www.2embed.cc/embedtv/${imdbId}&s=1&e=${episodeNumber}`,
                    is_default: false
                });
            }
        }

        // 3. FALLBACKS
        streams.push({
            server: "AnimeVibe (Backup)",
            type: "iframe",
            url: `https://404.html?msg=Use_Nani_Server_Above`,
            is_default: false
        });

        // Public Test Stream (For Testing)
        streams.push({
            server: "Public Test (Debug)",
            type: "hls",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            is_default: !imdbId
        });

        return streams;
    }
}

window.StreamManager = StreamManager;
