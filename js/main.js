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

    /**
     * DYNAMIC CONTENT LOGIC
     */
    async function initDynamicContent() {
        // Only run on Homepage
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
    async function loadAnimeDetails(id) {
        const anime = await window.AnimeAPI.getAnimeDetails(id);
        const container = $('#anime-details-container');

        if (!anime) {
            container.html('<div class="col-12 text-white">Error loading anime details.</div>');
            return;
        }

        const genres = anime.genres ? anime.genres.map(g => g.name).join(", ") : "Anime";
        const studios = anime.studios ? anime.studios.map(s => s.name).join(", ") : "Unknown";

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
                            <a href="#"><i class="fa fa-star"></i></a>
                            <a href="#"><i class="fa fa-star"></i></a>
                            <a href="#"><i class="fa fa-star"></i></a>
                            <a href="#"><i class="fa fa-star"></i></a>
                            <a href="#"><i class="fa fa-star-half-o"></i></a>
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
                                    <li><span>Score:</span> ${anime.score}</li>
                                    <li><span>Rating:</span> ${anime.rating}</li>
                                    <li><span>Duration:</span> ${anime.duration}</li>
                                    <li><span>Quality:</span> HD</li>
                                    <li><span>Episodes:</span> ${anime.episodes || '?'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="anime__details__btn">
                        <a href="#" class="follow-btn"><i class="fa fa-heart-o"></i> Follow</a>
                        <a href="anime-watching.html?id=${anime.mal_id}&ep=1" class="watch-btn"><span>Watch Now</span> <i class="fa fa-angle-right"></i></a>
                    </div>
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

        // Get Streams
        const streams = await window.StreamManager.getStreams(id, episode);

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
        const totalEps = anime?.episodes || 24; // fallback

        for (let i = 1; i <= totalEps; i++) {
            const active = (i == episode) ? 'style="background: #e53637; color: #fff;"' : '';
            epList.append(`<a href="anime-watching.html?id=${id}&ep=${i}" ${active}>Ep ${i}</a>`);
        }
    }

    // Template for Anime Card
    function createAnimeCard(anime) {
        // Safety check for image
        const imgUrl = anime.images?.jpg?.large_image_url || 'img/trending/trend-1.jpg';
        const genres = anime.genres ? anime.genres.map(g => g.name).slice(0, 2).join(", ") : "Anime";

        return `
            <div class="col-lg-4 col-md-6 col-sm-6">
                <div class="product__item glass-card">
                    <div class="product__item__pic set-bg" style="background-image: url('${imgUrl}');">
                        <div class="ep">${anime.episodes || '?'} / ${anime.episodes || '?'}</div>
                        <div class="comment"><i class="fa fa-star"></i> ${anime.score || 'N/A'}</div>
                        <div class="view"><i class="fa fa-eye"></i> ${anime.members ? (anime.members / 1000).toFixed(1) + 'k' : 'N/A'}</div>
                    </div>
                    <div class="product__item__text">
                        <ul>
                            <li>${anime.type || 'TV'}</li>
                            <li>${genres}</li>
                        </ul>
                        <h5><a href="anime-details.html?id=${anime.mal_id}">${anime.title}</a></h5>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadTrending() {
        if (!window.AnimeAPI) return;

        const trendingContainer = $('#trending-list');
        if (trendingContainer.length === 0) return;

        trendingContainer.html('<div class="text-white">Loading Trending...</div>');

        const animeList = await window.AnimeAPI.getTopAnime('airing', 6);

        if (animeList && animeList.length > 0) {
            trendingContainer.empty();
            animeList.forEach(anime => {
                trendingContainer.append(createAnimeCard(anime));
            });
        }
    }

    async function loadPopular() {
        if (!window.AnimeAPI) return;

        const popularContainer = $('#popular-list');
        if (popularContainer.length === 0) return;

        // Use 'bypopularity' filter
        const animeList = await window.AnimeAPI.getTopAnime('bypopularity', 6);

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
        const animeList = await window.AnimeAPI.getRecentEpisodes(6);

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