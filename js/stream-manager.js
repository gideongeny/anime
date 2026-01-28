/**
 * Stream Manager Service
 * Handles fetching video sources.
 * In a real app, this would connect to a backend or a scraping API.
 */

class StreamManager {

    // Get streams for a specific episode
    static async getStreams(animeId, episodeNumber, type = 'TV', animeTitle = '') {
        console.log(`Fetching streams for Anime ${animeId} Ep ${episodeNumber} Type: ${type}`);

        const streams = [];

        // 1. NANI / KUROYAMA (Primary MAL-based worker)
        streams.push({
            server: "Nani (Primary)",
            type: "iframe",
            url: `https://player.kurov.xyz/embed/${animeId}/${episodeNumber}`,
            is_default: true,
            priority: 1
        });

        // 2. Fetch IMDB/TMDB IDs for standard sources
        let imdbId = null;
        let tmdbId = null;
        try {
            // Try to find IMDB in external links
            const links = await window.AnimeAPI.getAnimeExternalLinks(animeId);
            if (links) {
                const imdbLink = links.find(l => l.url.includes('imdb.com/title/tt'));
                if (imdbLink) {
                    const match = imdbLink.url.match(/tt\d+/);
                    if (match) imdbId = match[0];
                }
            }

            // Fallback: If no IMDB, we might need a mapping service in a real app
            // For now, we attempt to use VidSrc.to's MAL integration if it exists (some support it)
        } catch (e) { console.log("Mapping Fetch Error", e); }

        // 3. VidSrc.to (Very Reliable)
        streams.push({
            server: "VidSrc.to",
            type: "iframe",
            url: `https://vidsrc.to/embed/anime/${animeId}/${episodeNumber}`,
            is_default: false,
            priority: 2
        });

        // 4. Vidsrc.me (Reliable Fallback)
        if (imdbId) {
            streams.push({
                server: "Vidsrc.me",
                type: "iframe",
                url: `https://vidsrc.me/embed/tv?imdb=${imdbId}&sea=1&epi=${episodeNumber}`,
                is_default: false,
                priority: 3
            });
        }

        // 5. SuperEmbed (Multi-source aggregator)
        streams.push({
            server: "SuperEmbed",
            type: "iframe",
            url: `https://multiembed.mov/?video_id=${animeId}&mal=1&s=1&e=${episodeNumber}`,
            is_default: false,
            priority: 4
        });

        // 6. AnimeSkip (Fast)
        streams.push({
            server: "AnimeSkip",
            type: "iframe",
            url: `https://player.animeskip.com/embed/${animeId}/${episodeNumber}`,
            is_default: false,
            priority: 5
        });

        // 7. Public Test Stream (Debug)
        streams.push({
            server: "Debug Stream",
            type: "hls",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            is_default: false,
            priority: 10
        });

        return streams.sort((a, b) => a.priority - b.priority);
    }
}

window.StreamManager = StreamManager;
