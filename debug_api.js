
// Run this in browser console to test
async function testAPI() {
    console.log("Testing Jikan API...");
    const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=3');
    const data = await response.json();

    console.log("Top Anime Data:", data);

    data.data.forEach(anime => {
        console.log(`Anime: ${anime.title}`);
        console.log(`Trailer:`, anime.trailer);
        console.log(`Embed URL: ${anime.trailer?.embed_url}`);
        console.log(`YouTube ID: ${anime.trailer?.youtube_id}`);
    });
}
testAPI();
