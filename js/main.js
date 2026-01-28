/*  ---------------------------------------------------
    Theme Name: Anime
    Description: Anime video tamplate
    Author: Colorib
    Author URI: https://colorib.com/
    Version: 1.0
    Created: Colorib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        // INIT DYNAMIC CONTENT
        initDynamicContent();
    });

    /*------------------
       URL Param Helper
    --------------------*/
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    // Search Switch
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    /*
     * DYNAMIC CONTENT LOGIC
     */
    async function initDynamicContent() {
        // Homepage
        if ($('.trending__product').length > 0) {
            await loadTrending();
            await loadPopular();
            await loadRecent();
        }

        // Details Page
        if ($('#anime-details-container').length > 0) {
            const id = getQueryParam('id');
            if (id) {
                await loadAnimeDetails(id);
            }
        }

        // Watching Page
        if ($('#dynamic-player-container').length > 0) {
            const id = getQueryParam('id');
            const ep = getQueryParam('ep') || 1;
            if (id) {
                await loadWatchPage(id, ep);
            }
        }

        // Categories Page
        if ($('#categories-container').length > 0) {
            const search = getQueryParam('search');
            const page = getQueryParam('page') || 1;
            await loadCategories(search, page);
        }

        // Handle Search
        $('#search-input').on('keypress', async function (e) {
            if (e.which == 13) {
                e.preventDefault();
                const query = $(this).val();
                if (query) {
                    window.location.href = `categories.html?search=${query}`;
                }
            }
        });
    }

    /*------------------
       Page Renderers
    --------------------*/

    async function loadCategories(query, page) {
        let data;
        if (query) {
            $('#category-title').text(`Search Results: ${query}`);
            const result = await window.AnimeAPI.searchAnime(query, page);
            data = result.data;
        } else {
            const result = await window.AnimeAPI.searchAnime(null, page);
            data = result.data;
        }

        const container = $('#categories-container');
        container.empty();

        if (!data || data.length === 0) {
            container.html('<div class="col-12 text-white">No anime found.</div>');
            return;
        }

        data.forEach(anime => {
            container.append(createAnimeCard(anime));
        });

        const pagination = $('#pagination-container');
        pagination.empty();
        const prevPage = parseInt(page) > 1 ? parseInt(page) - 1 : 1;
        const nextPage = parseInt(page) + 1;

        let paginationHtml = '';
        if (parseInt(page) > 1) {
            paginationHtml += `<a href="categories.html?search=${query || ''}&page=${prevPage}"><i class="fa fa-angle-left"></i> Prev</a>`;
        }
        paginationHtml += `<a href="#" class="current-page">${page}</a>`;
        paginationHtml += `<a href="categories.html?search=${query || ''}&page=${nextPage}">Next <i class="fa fa-angle-right"></i></a>`;

        pagination.html(paginationHtml);
    }
    async function loadAnimeDetails(id) {
        const anime = await window.AnimeAPI.getAnimeDetails(id);
        const cast = await window.AnimeAPI.getAnimeCharacters(id); // Fetch Cast
        const container = $('#anime-details-container');

        if (!anime) {
            container.html('<div class="col-12 text-white">Error loading anime details.</div>');
            return;
        }

        const genres = anime.genres ? anime.genres.map(g => g.name).join(", ") : "Anime";
        const studios = anime.studios ? anime.studios.map(s => s.name).join(", ") : "Unknown";

        // Cast List HTML
        let castHtml = '';
        if (cast && cast.length > 0) {
            castHtml = '<div class="row mt-4"><div class="col-12"><h5 class="text-white mb-3">Main Cast</h5></div>';
            cast.forEach(c => {
                castHtml += `
                    <div class="col-lg-2 col-md-3 col-4 mb-3 text-center">
                        <img src="${c.character.images.jpg.image_url}" class="rounded-circle mb-2" style="width: 60px; height: 60px; object-fit: cover;">
                        <div class="text-white small">${c.character.name}</div>
                    </div>
                 `;
            });
            castHtml += '</div>';
        }

        // Cinematic Background for Details Page
        if (anime.trailer && anime.trailer.youtube_id) {
            const videoId = anime.trailer.youtube_id;
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

            // Check if we have a banner container to inject into, otherwise prepend to breadcrumb or use overlay
            if ($('.anime-details-video-bg').length === 0) {
                // Inject a fixed background layer specifically for this page
                $('body').prepend(`<div class="anime-details-video-bg" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; opacity: 0.15; pointer-events: none; overflow: hidden;"><iframe src="${embedUrl}" frameborder="0" style="width: 100%; height: 100%; transform: scale(1.5);"></iframe></div>`);
            }
        }

        const html = `
            <div class="col-lg-3">
                <div class="anime__details__pic set-bg" style="background-image: url('${anime.images.jpg.large_image_url}')">
                    <div class="comment"><i class="fa fa-star"></i> ${anime.score}</div>
                    <div class="view"><i class="fa fa-users"></i> ${anime.members}</div>
                </div>
            </div>
            <div class="col-lg-9">
                <div class="anime__details__text">
                    <div class="anime__details__title">
                        <h3>${anime.title}</h3>
                        <span>${anime.title_japanese || ''}</span>
                    </div>
                    <div class="anime__details__rating">
                        <div class="rating">
                            <i class="fa fa-star text-warning"></i> ${anime.score}
                        </div>
                        <span>${anime.scored_by || 0} Votes</span>
                    </div>
                    <p>${anime.synopsis || 'No synopsis available.'}</p>
                    <div class="anime__details__widget">
                        <div class="row">
                            <div class="col-lg-6 col-md-6">
                                <ul>
                                    <li><span>Type:</span> ${anime.type}</li>
                                    <li><span>Studios:</span> ${studios}</li>
                                    <li><span>Date aired:</span> ${anime.aired.string}</li>
                                    <li><span>Status:</span> ${anime.status}</li>
                                    <li><span>Genre:</span> ${genres}</li>
                                </ul>
                            </div>
                            <div class="col-lg-6 col-md-6">
                                <ul>
                                    <li><span>Duration:</span> ${anime.duration}</li>
                                    <li><span>Quality:</span> HD</li>
                                    <li><span>Episodes:</span> ${anime.episodes || '?'}</li>
                                    <li><span>Rating:</span> ${anime.rating}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="anime__details__btn">
                        <a href="#" class="follow-btn"><i class="fa fa-heart-o"></i> Follow</a>
                        <a href="anime-watching.html?id=${anime.mal_id}&ep=1" class="watch-btn"><span>Watch Now</span> <i class="fa fa-angle-right"></i></a>
                    </div>
                    ${castHtml}
                </div>
            </div>
        `;

        container.html(html);
    }

    async function loadWatchPage(id, episode) {
        // Load Details first to get Title
        const anime = await window.AnimeAPI.getAnimeDetails(id);
        if (anime) {
            $('.breadcrumb__links span').text(anime.title);
        }

        // Get Streams (Passing Type)
        const streams = await window.StreamManager.getStreams(id, episode, anime.type);

        $('#player-section').hide();
        $('#dynamic-player-container').show();

        // Setup Player
        // We reuse the global player instance if possible, or init new
        const playerElement = document.getElementById('player');
        // If Plyr is already init, we might need to use its API.
        // For simplicity in this script, we assume global 'player' const from bottom of file is used, 
        // but we need to reference it.
        // Actually, the Plyr init at the bottom of the file runs on load. 
        // We need to access that instance. 
        // Let's re-init for safety or use the 'window.player' if we assigned it.
        // The bottom of file has `const player = ...` inside closure. We can't access it.
        // We will re-init it here for the #player element.

        const player = new Plyr('#player', {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        });

        // Setup Source Selector
        const selector = $('#source-selector');
        selector.empty();

        streams.forEach((stream, index) => {
            const activeClass = stream.is_default ? 'active' : '';
            if (stream.is_default) {
                changeSource(stream.url, stream.type, player);
            }

            const btn = `
                <label class="btn btn-secondary ${activeClass}" onclick="window.changeSource('${stream.url}', '${stream.type}')">
                    <input type="radio" name="options" autocomplete="off" ${stream.is_default ? 'checked' : ''}> ${stream.server}
                </label>
            `;
            selector.append(btn);
        });

        // Global function for onclick
        window.changeSource = function (url, type) {

            if (type === 'iframe') {
                console.log("Switching to iframe", url);
                const videoContainer = $('.anime__video__player');
                // Destroy plyr if exists layout-wise? 
                // Simple mock:
                videoContainer.html(`<iframe src="${url}" width="100%" height="500px" frameborder="0" allowfullscreen></iframe>`);
            } else {
                player.source = {
                    type: 'video',
                    sources: [{ src: url, type: type === 'hls' ? 'application/x-mpegURL' : 'video/mp4' }]
                };
            }
        };

        // Render Episode List
        const epList = $('#episode-list');
        epList.empty();

        // Add "If stuck" warning
        if ($('#player-help-text').length === 0) {
            $('.anime__video__player').after('<div id="player-help-text" class="text-white mt-2 small"><i class="fa fa-info-circle"></i> If the player is stuck, try switching the <b>Server</b> below (e.g., VidSrc or 2Embed).</div>');
        }

        let epData = [];
        try {
            epData = await window.AnimeAPI.getAnimeEpisodes(id);
        } catch (e) { console.log("Ep fetch failed", e); }

        // Logic: 
        // 1. If we have API data, use it (shows titles).
        // 2. If it's a Movie, force single button.
        // 3. Fallback to numeric loop if API empty but we have total count.

        const isMovie = anime.type === 'Movie' || anime.episodes === 1;

        if (isMovie) {
            epList.append(`<a href="anime-watching.html?id=${id}&ep=1" style="background: #e53637; color: #fff;">Full Movie</a>`);
        }
        else if (epData && epData.length > 0) {
            // Jikan returns paginated (first 100). Valid enough for most use cases.
            // We reverse it usually? No, let's keep it 1..N
            epData.forEach((ep) => {
                const epNum = ep.mal_id;
                // If pagination makes us miss episodes, this logic handles the first 100. 
                const active = (epNum == episode) ? 'style="background: #e53637; color: #fff;"' : '';
                // Add title if short
                let titleText = ep.title && Object.keys(epData).length < 20 ? `: ${ep.title}` : '';

                epList.append(`<a href="anime-watching.html?id=${id}&ep=${epNum}" ${active}>Ep ${epNum}${titleText}</a>`);
            });

            // If currently watching Ep > 100 and it's not in list, add a visual indicator or just a direct button
            if (episode > epData.length && episode > 100) {
                epList.append(`<a href="#" style="background: #e53637; color: #fff;">Ep ${episode} (Current)</a>`);
            }
        }
        else {
            // Numeric Fallback
            const totalEps = anime?.episodes || (anime.status === 'Currently Airing' ? 12 : 24);
            for (let i = 1; i <= totalEps; i++) {
                const active = (i == episode) ? 'style="background: #e53637; color: #fff;"' : '';
                epList.append(`<a href="anime-watching.html?id=${id}&ep=${i}" ${active}>Ep ${i}</a>`);
            }
        }
    }

    // Template for Anime Card
    function createAnimeCard(anime) {
        const imgUrl = anime.images?.jpg?.large_image_url || 'img/trending/trend-1.jpg';
        const genres = anime.genres ? anime.genres.map(g => g.name).slice(0, 2).join(", ") : "Anime";

        // Wrap the whole thing in a link for better UX
        return `
            <div class="col-lg-4 col-md-6 col-sm-6">
                <a href="anime-details.html?id=${anime.mal_id}" style="text-decoration: none; color: inherit;">
                    <div class="product__item glass-card">
                        <div class="product__item__pic set-bg" style="background-image: url('${imgUrl}');">
                            <div class="ep">${anime.episodes || '?'} / ${anime.episodes || '?'}</div>
                            <div class="comment"><i class="fa fa-star"></i> ${anime.score || 'N/A'}</div>
                            <div class="view"><i class="fa fa-users"></i> ${anime.members ? (anime.members / 1000).toFixed(1) + 'k' : 'N/A'}</div>
                        </div>
                        <div class="product__item__text">
                            <ul>
                                <li>${anime.type || 'TV'}</li>
                                <li>${genres}</li>
                            </ul>
                            <h5>${anime.title}</h5>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    async function loadTrending() {
        if (!window.AnimeAPI) return;

        const trendingContainer = $('#trending-list');
        // Also inject Hero Banner here if on homepage
        if (trendingContainer.length === 0) return;

        trendingContainer.html('<div class="text-white">Loading Trending...</div>');

        const animeList = await window.AnimeAPI.getTopAnime('airing', 12);

        if (animeList && animeList.length > 0) {
            trendingContainer.empty();

            // Setup Hero Banner with #1 Trending Anime
            setupHeroBanner(animeList[0]);

            animeList.forEach(anime => {
                trendingContainer.append(createAnimeCard(anime));
            });
        }
    }

    async function setupHeroBanner(anime) {
        const heroSection = $('.hero');
        if (heroSection.length === 0) return;

        // DESTROY Carousel and replace with Single Hero
        // This ensures no conflicts and gives us full control
        const heroHtml = `
            <div class="container-fluid p-0" style="position: relative; height: 80vh; overflow: hidden;">
                <!-- Video Background -->
                <div class="hero-video-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;">
                   ${getTrailerEmbed(anime.trailer?.youtube_id) || `<div style="width:100%; height:100%; background: url('${anime.images?.jpg?.large_image_url}') no-repeat center center; background-size: cover;"></div>`}
                </div>
                <!-- Gradient Overlay -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, #0b0c2a 10%, rgba(11, 12, 42, 0.4) 100%); z-index: 1;"></div>
                
                <!-- Content -->
                <div class="container" style="position: relative; z-index: 2; height: 100%; display: flex; align-items: center;">
                    <div class="row w-100">
                        <div class="col-lg-7">
                            <div class="hero__text pt-5">
                                <div class="label" style="background: #e53637; color: #fff; padding: 5px 15px; display: inline-block; margin-bottom: 20px; font-weight: 700;">
                                    ${anime.genres && anime.genres[0] ? anime.genres[0].name : 'Trending'}
                                </div>
                                <h1 style="color: #fff; font-size: 60px; font-weight: 700; line-height: 1.1; margin-bottom: 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.8);">
                                    ${anime.title}
                                </h1>
                                <p style="color: #ddd; font-size: 18px; margin-bottom: 30px; text-shadow: 1px 1px 5px rgba(0,0,0,0.8); max-width: 600px;">
                                    ${anime.synopsis ? anime.synopsis.substring(0, 200) + '...' : ''}
                                </p>
                                <a href="anime-watching.html?id=${anime.mal_id}&ep=1" class="site-btn" style="background: #e53637; border: none; padding: 15px 35px; font-size: 16px; font-weight: 700; border-radius: 5px; box-shadow: 0 10px 20px rgba(229, 54, 55, 0.4);">
                                    WATCH NOW <i class="fa fa-angle-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        heroSection.html(heroHtml);
    }

    function getTrailerEmbed(youtubeId) {
        if (!youtubeId) return null;
        // Mute=1 is CRITICAL for autoplay
        return `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1" 
                style="width: 100%; height: 200%; position: absolute; top: -50%; left: 0; pointer-events: none;" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
    }

    async function loadPopular() {
        if (!window.AnimeAPI) return;

        const popularContainer = $('#popular-list');
        if (popularContainer.length === 0) return;

        // Use 'bypopularity' filter
        const animeList = await window.AnimeAPI.getTopAnime('bypopularity', 12);

        if (animeList && animeList.length > 0) {
            popularContainer.empty();
            animeList.forEach(anime => {
                popularContainer.append(createAnimeCard(anime));
            });
        }
    }

    async function loadRecent() {
        if (!window.AnimeAPI) return;

        const recentContainer = $('#recent-list');
        if (recentContainer.length === 0) return;

        // Using 'upcoming' or 'favorite' just to get variety since 'recent' logic varies
        const animeList = await window.AnimeAPI.getRecentEpisodes(12);

        if (animeList && animeList.length > 0) {
            recentContainer.empty();
            animeList.forEach(anime => {
                recentContainer.append(createAnimeCard(anime));
            });
        }
    }

    /*------------------
        Navigation
    --------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
        Hero Slider
    --------------------*/
    var hero_s = $(".hero__slider");
    hero_s.owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        nav: true,
        navText: ["<span class='arrow_carrot-left'></span>", "<span class='arrow_carrot-right'></span>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        mouseDrag: false
    });

    /*------------------
        Video Player logic is handled inside loadWatchPage now
    --------------------*/

    /*------------------
        Niceselect
    --------------------*/
    $('select').niceSelect();

    /*------------------
        Scroll To Top
    --------------------*/
    $("#scrollToTopButton").click(function () {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
    });

})(jQuery);