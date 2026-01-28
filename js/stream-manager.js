/**
 * Stream Manager Service
 * Handles fetching video sources.
 * In a real app, this would connect to a backend or a scraping API.
 */

class StreamManager {

    // Get streams for a specific episode
    static async getStreams(animeId, episodeNumber) {
        console.log(`Fetching streams for Anime ${animeId} Ep ${episodeNumber}`);

        let imdbId = null;

        // 1. Try to find IMDB ID from Jikan
        const links = await window.AnimeAPI.getAnimeExternalLinks(animeId);
        if (links) {
            const imdbLink = links.find(l => l.name === 'Official Site' && l.url.includes('imdb')) ||
                links.find(l => l.url.includes('imdb'));

            if (imdbLink) {
                // Extract ID (tt1234567)
                const match = imdbLink.url.match(/tt\d+/);
                if (match) imdbId = match[0];
            }
        }

        const streams = [];

        // Source A: VidSrc 
        if (imdbId) {
            streams.push({
                server: "VidSrc (Fast)",
                type: "iframe",
                url: `https://vidsrc.to/embed/tv/${imdbId}/${1}/${episodeNumber}`,
                is_default: true
            });
            streams.push({
                server: "2Embed",
                type: "iframe",
                url: `https://www.2embed.cc/embedtv/${imdbId}&s=1&e=${episodeNumber}`,
                is_default: false
            });
        }

        // FALLBACK: Public Test Stream
        streams.push({
            server: "Public Test (Backup)",
            type: "hls",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            is_default: !imdbId
        });

        return streams;
    }
}

window.StreamManager = StreamManager;
