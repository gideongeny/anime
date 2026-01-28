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
            await loadSidebars();
        }

        // Details Page
        if ($('#anime-details-container').length > 0) {
            const id = getQueryParam('id');
            if (id) {
                await loadAnimeDetails(id);
                loadComments(id, '0'); // '0' for general anime comments
                loadSidebars();
            }
        }

        // Watching Page
        if ($('#dynamic-player-container').length > 0) {
            const id = getQueryParam('id');
            const ep = getQueryParam('ep') || 1;
            if (id) {
                await loadWatchPage(id, ep);
                loadComments(id, ep);
            }
        }

        // Categories Page
        if ($('#categories-container').length > 0) {
            const search = getQueryParam('search');
            const page = getQueryParam('page') || 1;
            await loadCategories(search, page);
            loadSidebars();
        }

        // Handle Search
        $('#search-input').on('keyup', async function (e) {
            const query = $(this).val();
            if (query.length < 3) {
                $('#search-results').remove();
                return;
            }

            // Simple Live Search Dropdown
            if ($('#search-results').length === 0) {
                $(this).after('<div id="search-results" class="glass-card" style="position:absolute; width:100%; z-index:1000; top:60px; max-height:400px; overflow-y:auto;"></div>');
            }

            const results = await window.AnimeAPI.searchAnime(query, 1, 5);
            const dropdown = $('#search-results');
            dropdown.empty();

            results.forEach(anime => {
                dropdown.append(`
                    <a href="anime-details.html?id=${anime.mal_id}" class="d-flex align-items-center p-2 border-bottom" style="text-decoration:none; color:#fff;">
                        <img src="${anime.images.jpg.small_image_url}" width="40" class="mr-3">
                        <div>
                            <div style="font-size:14px; font-weight:700;">${anime.title}</div>
                            <div style="font-size:12px; opacity:0.7;">${anime.type}</div>
                        </div>
                    </a>
                `);
            });
        });

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

    function showSkeletons(container, count = 12) {
        container.empty();
        for (let i = 0; i < count; i++) {
            container.append(`
                <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
                    <div class="skeleton-card skeleton"></div>
                    <div class="skeleton-text skeleton mt-2"></div>
                </div>
            `);
        }
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

        // Cinematic Background for Details Page (Fixed)
        // Remove old if exists
        $('.anime-details-video-bg').remove();

        const trailerEmbed = getTrailerEmbed(anime.trailer?.youtube_id);
        if (trailerEmbed) {
            // Inject a fixed background layer with higher visibility
            $('body').prepend(`
                <div class="anime-details-video-bg" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 12, 42, 0.85); z-index: 2;"></div>
                    <div style="opacity: 0.4; filter: blur(5px); transform: scale(1.2); width:100%; height:100%;">
                        ${trailerEmbed}
                    </div>
                </div>
            `);
        } else {
            // Image fallback
            $('body').prepend(`
                <div class="anime-details-video-bg" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: url('${anime.images?.jpg?.large_image_url}') no-repeat center center; background-size: cover;">
                     <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 12, 42, 0.9);"></div>
                </div>
            `);
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
                        <a href="javascript:void(0)" class="follow-btn" id="watchlist-btn"><i class="fa fa-heart-o"></i> Add to Watchlist</a>
                        <a href="anime-watching.html?id=${anime.mal_id}&ep=1" class="watch-btn"><span>Watch Now</span> <i class="fa fa-angle-right"></i></a>
                    </div>
                    <script type="module">
                        import { AuthService } from './js/firebase-config.js';
                        $('#watchlist-btn').on('click', async function() {
                            try {
                                const added = await window.AuthService.toggleWatchlist(
                                    '${anime.mal_id}', 
                                    \`${anime.title.replace(/'/g, "\\'")}\`, 
                                    '${anime.images?.jpg?.large_image_url}'
                                );
                                $(this).html(added ? '<i class="fa fa-heart"></i> In Watchlist' : '<i class="fa fa-heart-o"></i> Add to Watchlist');
                            } catch(e) {
                                alert(e.message);
                            }
                        });
                    </script>
                    ${castHtml}
                </div>
            </div>
        `;

        container.html(html);
    }

    /*------------------
       Comment System
    --------------------*/
    function loadComments(animeId, episode) {
        const container = $('#comments-container');
        if (container.length === 0) return;

        // Subscribing to real-time updates
        const unsubscribe = window.CommentService.subscribeToComments(animeId, episode, (comments) => {
            // Remove loading indicator
            container.find('.opacity-50').remove();

            // Re-render comments list (keep the title)
            const title = container.find('.section-title');
            container.empty().append(title);

            if (comments.length === 0) {
                container.append('<div class="text-white small opacity-50">No reviews yet. Be the first!</div>');
            }

            comments.forEach(comment => {
                const date = comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleString() : 'Just now';
                container.append(`
                    <div class="anime__review__item">
                        <div class="anime__review__item__pic">
                            <img src="img/anime/review-1.jpg" alt="">
                        </div>
                        <div class="anime__review__item__text">
                            <h6>${comment.userEmail.split('@')[0]} - <span>${date}</span></h6>
                            <p>${comment.text}</p>
                        </div>
                    </div>
                `);
            });
        });

        // Handle Posting
        $('#comment-form').on('submit', async function (e) {
            e.preventDefault();
            const text = $('#comment-text').val();
            if (!text) return;

            try {
                await window.CommentService.postComment(animeId, episode, text);
                $('#comment-text').val('');
            } catch (error) {
                alert(error.message);
            }
        });
    }

    /*------------------
       Sidebars (Trending / Like)
    --------------------*/
    async function loadSidebars() {
        const sidebar = $('#sidebar-container');
        const trendingSidebar = $('#trending-sidebar'); // For index.html

        if (sidebar.length === 0 && trendingSidebar.length === 0) return;

        const sidebarData = await window.AnimeAPI.getTopAnime('favorite', 5);

        if (sidebar.length > 0) {
            // "You might like" logic - reuse top anime
            sidebar.find('.product__sidebar__view__item').remove();
            sidebarData.forEach(anime => {
                sidebar.append(`
                    <div class="product__sidebar__view__item set-bg" data-setbg="${anime.images.jpg.image_url}" style="background-image: url('${anime.images.jpg.image_url}')">
                        <div class="ep">${anime.score} / 10</div>
                        <div class="view"><i class="fa fa-eye"></i> ${anime.members}</div>
                        <h5><a href="anime-details.html?id=${anime.mal_id}">${anime.title}</a></h5>
                    </div>
                `);
            });
        }

        if (trendingSidebar.length > 0) {
            trendingSidebar.empty();
            sidebarData.forEach(anime => {
                trendingSidebar.append(`
                    <div class="product__sidebar__view__item set-bg" data-setbg="${anime.images.jpg.image_url}" style="background-image: url('${anime.images.jpg.image_url}')">
                        <div class="ep">${anime.score} / 10</div>
                        <div class="view"><i class="fa fa-eye"></i> ${anime.members}</div>
                        <h5><a href="anime-details.html?id=${anime.mal_id}">${anime.title}</a></h5>
                    </div>
                `);
            });
        }
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

        // Setup Player with Premium Options
        const player = new Plyr('#player', {
            controls: [
                'play-large', 'play', 'progress', 'current-time', 'mute', 'volume',
                'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ],
            settings: ['quality', 'speed'],
            keyboard: { focused: true, global: true },
            tooltips: { controls: true, seek: true }
        });

        window.player = player;

        // 1. Keyboard Shortcuts (Space: Play/Pause, F: Fullscreen, M: Mute, Arrows: Seek)
        $(document).on('keydown', (e) => {
            if ($(e.target).is('input, textarea')) return;

            switch (e.code) {
                case 'Space': e.preventDefault(); player.togglePlay(); break;
                case 'KeyF': e.preventDefault(); player.fullscreen.toggle(); break;
                case 'KeyM': e.preventDefault(); player.muted = !player.muted; break;
                case 'ArrowRight': player.forward(10); break;
                case 'ArrowLeft': player.rewind(10); break;
            }
        });

        // 2. Theater Mode Logic
        $('#theater-mode').on('click', function () {
            $('.anime__video__player').toggleClass('theater-mode');
            $(this).toggleClass('active');
            // Force redraw/resize for Plyr
            window.dispatchEvent(new Event('resize'));
        });

        // 3. Auto-Play Next logic
        player.on('ended', () => {
            const nextEp = parseInt(episode) + 1;
            const nextLink = $(`#episode-list a[data-episode="${nextEp}"]`);
            if (nextLink.length > 0) {
                console.log("Auto-playing next episode...");
                nextLink[0].click();
            }
        });

        // Setup Source Selector (Sleek UI)
        const selector = $('#source-selector');
        selector.empty().append('<h6 class="text-white mb-3"><i class="fa fa-server mr-2"></i> Select Video Source</h6>');

        const btnGroup = $('<div class="source-btn-group"></div>');
        streams.forEach((stream, index) => {
            const activeClass = stream.is_default ? 'active' : '';
            if (stream.is_default) {
                changeSource(stream.url, stream.type);
            }

            const btn = $(`
                <button class="source-btn ${activeClass}" data-url="${stream.url}" data-type="${stream.type}">
                    <i class="fa fa-play-circle mr-1"></i> ${stream.server}
                </button>
            `);

            btn.on('click', function () {
                $('.source-btn').removeClass('active');
                $(this).addClass('active');
                changeSource($(this).data('url'), $(this).data('type'));
            });

            btnGroup.append(btn);
        });
        selector.append(btnGroup);

        // Global function for source switching
        window.changeSource = function (url, type) {
            console.log("Switching Source:", url, type);
            const container = $('.anime__video__player');

            if (type === 'iframe') {
                container.find('.plyr').hide();
                let iframe = container.find('#iframe-player');
                if (iframe.length === 0) {
                    iframe = $('<iframe id="iframe-player" allowfullscreen frameborder="0" style="width:100%; height:500px; border-radius:8px; border:none;"></iframe>');
                    container.append(iframe);
                }
                iframe.attr('src', url).show();
            } else {
                container.find('#iframe-player').hide();
                container.find('.plyr').show();
                player.source = {
                    type: 'video',
                    sources: [{ src: url, type: type === 'hls' ? 'application/x-mpegURL' : 'video/mp4' }]
                };
                player.once('canplay', () => player.play());
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
            epList.append(`<a href="anime-watching.html?id=${id}&ep=1" style="background: #e53637; color: #fff;" data-episode="1">Full Movie</a>`);
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

                epList.append(`<a href="anime-watching.html?id=${id}&ep=${epNum}" ${active} data-episode="${epNum}">Ep ${epNum}${titleText}</a>`);
            });

            // If currently watching Ep > 100 and it's not in list, add a visual indicator or just a direct button
            if (episode > epData.length && episode > 100) {
                epList.append(`<a href="#" style="background: #e53637; color: #fff;" data-episode="${episode}">Ep ${episode} (Current)</a>`);
            }
        }
        else {
            // Numeric Fallback
            const totalEps = anime?.episodes || (anime.status === 'Currently Airing' ? 12 : 24);
            for (let i = 1; i <= totalEps; i++) {
                const active = (i == episode) ? 'style="background: #e53637; color: #fff;"' : '';
                epList.append(`<a href="anime-watching.html?id=${id}&ep=${i}" ${active} data-episode="${i}">Ep ${i}</a>`);
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
        if (trendingContainer.length === 0) return;

        showSkeletons(trendingContainer, 6);

        // Increase limit to 24 to "Flood" the site
        const animeList = await window.AnimeAPI.getTopAnime('airing', 24);

        if (animeList && animeList.length > 0) {
            trendingContainer.empty();
            setupHeroBanner(animeList[0]);
            animeList.forEach(anime => {
                trendingContainer.append(createAnimeCard(anime));
            });
        }
    }

    async function setupHeroBanner(animeList) {
        const heroSection = $('.hero');
        if (heroSection.length === 0) return;

        // Ensure we have a few items
        const selected = animeList.slice(0, 3);

        // Re-create the owl-carousel structure
        let sliderHtml = '<div class="hero__slider owl-carousel">';

        for (let anime of selected) {
            let heroImage = anime.images?.jpg?.large_image_url;
            let trailerId = anime.trailer?.youtube_id;

            // Try to Enrich with TMDB
            if (window.TMDBAPI) {
                try {
                    const searchRes = await window.TMDBAPI.search(anime.title, anime.year);
                    if (searchRes && searchRes.backdrop_path) {
                        heroImage = window.TMDBAPI.getImageUrl(searchRes.backdrop_path, 'original');
                    }
                } catch (e) { }
            }

            sliderHtml += `
                <div class="hero__items set-bg" data-setbg="${heroImage}" style="position: relative;">
                    <!-- Video Background (Initial Hidden) -->
                    <div class="hero-video-bg" data-video-id="${trailerId}" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:0; display:none;"></div>
                    
                    <div class="row" style="position: relative; z-index: 2;">
                        <div class="col-lg-7">
                            <div class="hero__text">
                                <div class="label">${anime.genres && anime.genres[0] ? anime.genres[0].name : 'Trending'}</div>
                                <h1 style="color:#fff; text-shadow: 2px 2px 10px #000;">${anime.title}</h1>
                                <p style="text-shadow: 1px 1px 5px #000;">${anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : ''}</p>
                                <a href="anime-watching.html?id=${anime.mal_id}&ep=1" class="site-btn">WATCH NOW <i class="fa fa-angle-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        sliderHtml += '</div>';

        heroSection.html(sliderHtml);

        // Re-initialize Background Images
        $('.hero__items').each(function () {
            var bg = $(this).data('setbg');
            $(this).css('background-image', 'url(' + bg + ')');
        });

        // Initialize Owl Carousel
        var hero_s = $(".hero__slider");
        hero_s.owlCarousel({
            loop: true, margin: 0, items: 1, dots: true, nav: true,
            navText: ["<span class='arrow_carrot-left'></span>", "<span class='arrow_carrot-right'></span>"],
            animateOut: 'fadeOut', animateIn: 'fadeIn', smartSpeed: 1200, autoHeight: false,
            autoplay: true, autoplayTimeout: 10000, mouseDrag: false
        });

        // Handle Video Previews on Active Slide
        hero_s.on('translated.owl.carousel', function (event) {
            // Stop all other videos
            $('.hero-video-bg').hide().empty();

            // Start active video
            const activeSlide = $('.owl-item.active .hero__items');
            const videoContainer = activeSlide.find('.hero-video-bg');
            const videoId = videoContainer.data('video-id');

            if (videoId) {
                // Short delay to let the slide settle
                setTimeout(() => {
                    const embed = getTrailerEmbed(videoId);
                    videoContainer.html(embed).fadeIn(1000);
                }, 500);
            }
        });

        // Trigger first slide video
        setTimeout(() => hero_s.trigger('translated.owl.carousel'), 1000);
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

        // Use 'bypopularity' filter - Increase to 24
        const animeList = await window.AnimeAPI.getTopAnime('bypopularity', 24);

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

        // Increase to 24
        const animeList = await window.AnimeAPI.getRecentEpisodes(24);

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