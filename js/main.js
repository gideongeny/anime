/*  ---------------------------------------------------
    Theme Name: Anime
    Description: Void Dark Elite v2.7 (FIRESTORE MASTER SYNC)
    Author: Antigravity AI
---------------------------------------------------------  */

'use strict';

(function ($) {

    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");
        initStarParticles();
        initDynamicContent();
        initAuthState();
        $('body').css('opacity', '0').animate({ opacity: 1 }, 400);
    });

    const delay = ms => new Promise(res => setTimeout(res, ms));

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    $('.search-switch').on('click', function (e) { e.preventDefault(); $('.search-model').fadeIn(400); });
    $('.search-close-switch').on('click', function () { $('.search-model').fadeOut(400, function () { $('#search-input').val(''); }); });

    function initStarParticles() {
        if ($('#star-canvas').length === 0) $('body').prepend('<canvas id="star-canvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;"></canvas>');
        const canvas = document.getElementById('star-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, stars = [];
        function resize() {
            width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight;
            stars = []; for (let i = 0; i < 200; i++) stars.push({ x: Math.random() * width, y: Math.random() * height, size: Math.random() * 1.5, speed: Math.random() * 0.4 + 0.1, opacity: Math.random() });
        }
        function draw() {
            ctx.clearRect(0, 0, width, height);
            stars.forEach(s => { ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill(); s.y -= s.speed; if (s.y < 0) s.y = height; s.opacity += (Math.random() - 0.5) * 0.05; if (s.opacity < 0.1) s.opacity = 0.1; if (s.opacity > 0.9) s.opacity = 0.9; });
            requestAnimationFrame(draw);
        }
        window.addEventListener('resize', resize); resize(); draw();
    }

    // --- AUTH STATE UI ---
    function initAuthState() {
        if (!window.AuthService) return;
        window.AuthService.onAuthChange(user => {
            // Stronger selector to catch all profile links regardless of URL format
            const profileLink = $('.header__right a').filter(function() { 
                return $(this).attr('href').includes('login.html') || $(this).find('.icon_profile').length > 0 || $(this).find('img').length > 0; 
            });
            const navDropdown = $('.header__menu .dropdown');
            const path = window.location.pathname;

            if (user) {
                // Global Icon Update
                profileLink.attr('href', './profile.html');
                if (user.photoURL) {
                    profileLink.html(`<img src="${user.photoURL}" style="width:30px; height:30px; border-radius:50%; border: 2px solid #ff2d55; object-fit:cover;">`);
                } else {
                    profileLink.html(`<span class="icon_profile" style="color:#ff2d55;"></span>`);
                }

                // Redirect away from login/signup
                if (path.includes('login.html') || path.includes('signup.html')) { window.location.href = 'profile.html'; }

                // Dropdown Management
                navDropdown.find('li').each(function() {
                    const text = $(this).text().trim().toLowerCase();
                    if (text === 'sign up' || text === 'login') $(this).hide();
                    else $(this).show();
                });
                
                if (navDropdown.find('#nav-logout').length === 0) {
                    navDropdown.append('<li><a href="#" id="nav-logout">Logout</a></li>');
                    $('#nav-logout').on('click', async (e) => { e.preventDefault(); await window.AuthService.logout(); window.location.reload(); });
                }
            } else {
                profileLink.attr('href', './login.html').html(`<span class="icon_profile"></span>`);
                navDropdown.find('li').show();
                $('#nav-logout').parent().remove();
            }
        });
    }

    async function initDynamicContent() {
        try {
            if ($('#hero-section').length > 0) { loadContinueWatching(); loadHero(); loadTrending(); loadPopular(); loadGenreSections(); await delay(1200); loadSidebarData(); }
            if ($('#anime-details-container').length > 0) { const id = getQueryParam('id'); if (id) { loadAnimeDetails(id); loadRecommendations(id); } }
            if ($('#dynamic-player-container').length > 0) {
                const id = getQueryParam('id'); const ep = parseInt(getQueryParam('ep') || 1); const season = parseInt(getQueryParam('s') || 1);
                if (id) {
                    const anime = await window.TmdbAPI.getDetails(id, 'tv') || await window.TmdbAPI.getDetails(id, 'movie');
                    const type = anime && anime.number_of_seasons ? 'tv' : 'movie';
                    loadWatchPage(id, ep, season, type, anime); loadRecommendations(id, type); initTheaterMode(); initReviewSystem(id);
                }
            }
            if ($('#news-container').length > 0) { initNewsPage(); }
            if ($('.schedule-timeline').length > 0) { initSchedule(); }
            if ($('#library-content').length > 0) { initLibrary(); }
            if ($('#profile-container').length > 0) { initProfilePage(); }
            if ($('#categories-container').length > 0) { loadCategories(getQueryParam('search'), getQueryParam('page') || 1, getQueryParam('genre')); }
        } catch(e) { console.error("Initialization error", e); }

        $('#search-input').on('input', async function () {
            const query = $(this).val(); if (query.length < 2) { $('#search-results').hide(); return; }
            let dropdown = $('#search-results');
            if (dropdown.length === 0) { $(this).after('<div id="search-results" class="glass-panel" style="position:absolute; width:100%; z-index:1000; top:60px; max-height:400px; overflow-y:auto; padding:15px; border-radius:12px;"></div>'); dropdown = $('#search-results'); }
            dropdown.show().html('<div class="text-white text-center p-3">Searching...</div>');
            const results = await window.TmdbAPI.discoverAnime(query, 1);
            dropdown.empty();
            results.slice(0, 10).forEach(anime => {
                dropdown.append(`<a href="anime-details.html?id=${anime.id}&tmdb=1" class="d-flex align-items-center mb-3 p-2 rounded hover-bg" style="color:#fff; text-decoration:none;"><img src="${window.TmdbAPI.getImageUrl(anime.poster_path, 'w92')}" style="width:40px; border-radius:4px; margin-right:12px;"><div><div style="font-size:13px; font-weight:700;">${anime.name || anime.title}</div><div style="font-size:10px; opacity:0.6;">${anime.media_type === 'tv' ? 'Series' : 'Movie'}</div></div></a>`);
            });
        });
    }

    // --- PROFILE PAGE ---
    function initProfilePage() {
        window.AuthService.onAuthChange(async user => {
            if (!user) { window.location.href = 'login.html'; return; }
            $('#profile-name').text(user.displayName || 'Elite Member');
            $('#profile-email').text(user.email);
            if (user.photoURL) $('#profile-img').attr('src', user.photoURL);
            
            const history = await window.AuthService.getWatchHistory();
            const watchlist = await window.AuthService.getWatchlist();
            
            $('#stats-history').text(history.length);
            $('#stats-bookmarks').text(watchlist.length);
            
            const histContainer = $('#profile-history-list').empty();
            if (history.length === 0) histContainer.html('<div class="col-12 text-white-50">No history found.</div>');
            history.slice(0, 4).forEach(item => {
                histContainer.append(`<div class="col-lg-3 col-md-6 col-6 mb-4"><div class="product__item"><a href="anime-details.html?id=${item.id}&tmdb=1"><div class="product__item__pic set-bg" style="background-image: url('${item.poster}')"><div class="ep">${item.episode}</div></div></a><div class="product__item__text"><h6 class="text-white text-truncate">${item.title}</h6></div></div></div>`);
            });

            const libContainer = $('#profile-bookmarks-list').empty();
            if (watchlist.length === 0) libContainer.html('<div class="col-12 text-white-50">No bookmarks found.</div>');
            watchlist.slice(0, 4).forEach(item => {
                libContainer.append(`<div class="col-lg-3 col-md-6 col-6 mb-4"><div class="product__item"><a href="anime-details.html?id=${item.id}&tmdb=1"><div class="product__item__pic set-bg" style="background-image: url('${item.poster}')"></div></a><div class="product__item__text"><h6 class="text-white text-truncate">${item.title}</h6></div></div></div>`);
            });
        });
        $('#logout-btn').on('click', async () => { await window.AuthService.logout(); window.location.href = 'index.html'; });
    }

    // --- WATCH PAGE & TRACKING ---
    function saveToHistory(item) { let history = JSON.parse(localStorage.getItem('anime_history') || '[]'); history = history.filter(i => i.id != item.id); history.unshift(item); if (history.length > 20) history = history.slice(0, 20); localStorage.setItem('anime_history', JSON.stringify(history)); }
    function saveContinueWatching(item) { let list = JSON.parse(localStorage.getItem('anime_continue') || '[]'); list = list.filter(i => i.id != item.id); list.unshift(item); if (list.length > 5) list = list.slice(0, 5); localStorage.setItem('anime_continue', JSON.stringify(list)); }
    function loadContinueWatching() { const list = JSON.parse(localStorage.getItem('anime_continue') || '[]'); if (list.length === 0) return; $('#continue-watching-section').show(); const container = $('#continue-list').empty(); list.forEach(item => { container.append(`<div class="col-lg-3 col-md-4 col-6"><a href="anime-watching.html?id=${item.id}&tmdb=1&ep=${item.ep}&s=${item.s}"><div class="continue__item"><div class="continue__item__pic set-bg" style="background-image: url('${window.TmdbAPI.getImageUrl(item.img, 'w780')}')"><div class="progress-bar-wrap"><div class="progress-bar-fill" style="width: 85%;"></div></div></div><div class="continue__item__text"><h6 class="text-white text-truncate">${item.title}</h6><p class="small text-danger mb-0">Season ${item.s} • Episode ${item.ep}</p></div></div></a></div>`); }); }

    async function loadWatchPage(id, ep, s, type, anime) {
        const streams = await window.StreamManager.getStreams(id, ep, type, id, s);
        if (streams && streams[0]) {
            $('#dynamic-player-container').html(`<div id="player-wrapper" style="position:relative; width:100%; transition: 0.5s ease;"><button id="theater-toggle" class="glass-panel" style="position:absolute; right:20px; top:20px; z-index:10; border:0; color:#fff; padding:10px; border-radius:8px; cursor:pointer;"><i class="fa fa-expand"></i> Theater</button><iframe src="${streams[0].url}" style="width:100%; height:700px; border:none; border-radius:20px;" allowfullscreen></iframe></div>`);
            $('#breadcrumb-anime-name').text(anime.name || anime.title);
            saveToHistory({ id, ep, s, type, title: anime.name || anime.title, img: anime.poster_path });
            saveContinueWatching({ id, ep, s, type, title: anime.name || anime.title, img: anime.backdrop_path });
            
            window.AuthService.onAuthChange(user => {
                if (user) window.AuthService.saveWatchProgress(id, anime.name || anime.title, ep, true, window.TmdbAPI.getImageUrl(anime.poster_path, 'w342'));
            });
            
            if (type === 'tv') { loadWatchEpisodes(id, s, ep, anime.name || anime.title); checkNextEpisode(id, s, ep); }
        }
    }
    async function loadWatchEpisodes(id, s, currentEp, title) {
        const container = $('#episode-list').empty(); const episodes = await window.TmdbAPI.getTvSeasonEpisodes(id, s);
        episodes.forEach(ep => {
            const isActive = ep.episode_number === currentEp;
            container.append(`<div class="col-lg-12 mb-2"><div class="p-3 rounded glass-panel ${isActive ? 'active-ep' : 'hover-bg'} d-flex align-items-center" style="background: ${isActive ? 'rgba(255,45,85,0.1)' : 'rgba(255,255,255,0.03)'}; border: ${isActive ? '1px solid #ff2d55' : '1px solid transparent'}"><a href="anime-watching.html?id=${id}&tmdb=1&s=${s}&ep=${ep.episode_number}" class="text-white flex-grow-1 font-weight-bold">Episode ${ep.episode_number}: ${ep.name || 'TBA'}</a><a href="https://vidvault.ru/tv/${id}/${s}/${ep.episode_number}" target="_blank" class="text-danger ml-3"><i class="fa fa-download"></i></a></div></div>`);
        });
    }
    async function checkNextEpisode(id, s, ep) {
        const nextEpNum = ep + 1; const episodes = await window.TmdbAPI.getTvSeasonEpisodes(id, s);
        const nextEp = episodes.find(e => e.episode_number === nextEpNum);
        if (nextEp) { $('#next-episode-container').fadeIn(); $('#next-ep-title').text(`Episode ${nextEp.episode_number}: ${nextEp.name || 'TBA'}`); $('#next-ep-link').attr('href', `anime-watching.html?id=${id}&tmdb=1&s=${s}&ep=${nextEp.episode_number}`); } else { $('#next-episode-container').hide(); }
    }

    // --- REVIEWS ---
    function initReviewSystem(id) { loadReviews(id); $('#comment-form').on('submit', function(e) { e.preventDefault(); const text = $('#comment-text').val(); if (text.length < 5) return; saveReview(id, text); $('#comment-text').val(''); }); }
    function saveReview(id, text) { let reviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]'); const user = window.AuthService.getCurrentUser(); reviews.unshift({ text, date: new Date().toLocaleDateString(), user: user ? user.displayName || 'Elite Member' : 'Guest Member' }); localStorage.setItem(`reviews_${id}`, JSON.stringify(reviews.slice(0, 50))); loadReviews(id); }
    function loadReviews(id) { const container = $('#public-reviews-container').empty(); let reviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]'); if (reviews.length === 0) { container.html('<div class="text-white-50 small text-center p-4">Be the first to review this show!</div>'); return; } reviews.forEach(r => { container.append(`<div class="anime__review__item glass-panel p-3 mb-3" style="border-radius:12px; background: rgba(255,255,255,0.02);"><div class="anime__review__item__text"><h6>${r.user} - <span>${r.date}</span></h6><p class="text-white mb-0">${r.text}</p></div></div>`); }); }

    // --- LIBRARY & FIRESTORE SYNC ---
    async function initLibrary() {
        $('.lib-tab').on('click', function(e) { e.preventDefault(); $('.lib-tab').removeClass('active'); $(this).addClass('active'); renderLibrary($(this).data('type')); });
        window.AuthService.onAuthChange(() => renderLibrary('bookmarks'));
    }
    async function renderLibrary(type) {
        const container = $('#library-content').html('<div class="col-12 text-center p-5"><div class="spinner-border text-danger"></div></div>');
        let items = [];
        
        if (type === 'bookmarks') {
            items = await window.AuthService.getWatchlist();
        } else if (type === 'history') {
            items = await window.AuthService.getWatchHistory();
        } else {
            container.html('<div class="col-12 text-center p-5 text-white-50">Downloads are individual links to VidVault.</div>'); return;
        }

        container.empty();
        if (items.length === 0) { container.html('<div class="col-12 text-center text-white-50 p-5">Nothing here yet...</div>'); return; }
        items.forEach(item => {
            const poster = item.poster || window.TmdbAPI.getImageUrl(item.img || item.poster_path, 'w500');
            container.append(`<div class="col-lg-3 col-md-4 col-6 mb-4"><div class="product__item"><a href="anime-details.html?id=${item.id}&tmdb=1"><div class="product__item__pic set-bg" style="background-image: url('${poster}')">${item.episode ? `<div class="ep">EP ${item.episode}</div>` : ''}</div></a><div class="product__item__text mt-3"><h5 class="text-truncate"><a href="#">${item.title || item.name}</a></h5></div></div></div>`);
        });
    }

    async function toggleLibraryItem(item) {
        const user = window.AuthService.getCurrentUser();
        const imgUrl = window.TmdbAPI.getImageUrl(item.img || item.poster_path, 'w342');
        if (user) {
            await window.AuthService.toggleWatchlist(item.id, item.title, imgUrl);
            updateLibButton(item.id);
        } else {
            let lib = JSON.parse(localStorage.getItem('anime_library') || '[]');
            const exists = lib.find(l => l.id == item.id);
            if (exists) lib = lib.filter(l => l.id != item.id);
            else lib.push(item);
            localStorage.setItem('anime_library', JSON.stringify(lib));
            updateLibButton(item.id);
        }
    }

    async function updateLibButton(id) {
        const user = window.AuthService.getCurrentUser();
        if (user) {
            const watchlist = await window.AuthService.getWatchlist();
            const exists = watchlist.find(item => item.id == id);
            $('#lib-toggle').toggleClass('active', !!exists).html(exists ? '<i class="fa fa-heart"></i> In Library' : '<i class="fa fa-heart"></i> Add to Library');
        } else {
            let lib = JSON.parse(localStorage.getItem('anime_library') || '[]');
            const exists = lib.find(l => l.id == id);
            $('#lib-toggle').toggleClass('active', !!exists).html(exists ? '<i class="fa fa-heart"></i> In Library' : '<i class="fa fa-heart"></i> Add to Library');
        }
    }

    // --- SHARED ---
    async function loadHero() { try { const data = await window.TmdbAPI.getTrendingAnime(1); if (!data || data.length === 0) return; const slider = $('.hero__slider'); $('#hero-skeleton').fadeOut(); slider.show().empty(); data.slice(0, 8).forEach(anime => { const backdrop = window.TmdbAPI.getImageUrl(anime.backdrop_path, 'original'); slider.append(`<div class="hero__items set-bg" style="background-image: url('${backdrop}')"><div class="container"><div class="row"><div class="col-lg-12"><div class="hero__text" style="padding-top:120px;"><div class="label">TRENDING</div><h2 style="font-size:60px; font-weight:900;">${anime.name || anime.title}</h2><p style="font-size:18px; max-width:800px;">${anime.overview.substring(0, 200)}...</p><a href="anime-details.html?id=${anime.id}&tmdb=1" class="site-btn">Watch Now</a></div></div></div></div></div>`); }); slider.owlCarousel({ loop: true, items: 1, dots: true, nav: true, navText: ["<span class='arrow_carrot-left'></span>", "<span class='arrow_carrot-right'></span>"], smartSpeed: 1200, autoplay: true }); } catch(e) { console.error("Hero load error", e); } }
    function renderSlider(container, data) { if (!data || data.length === 0) { container.html('<div class="text-white-50 p-5">No data available.</div>'); return; } container.empty(); data.forEach(anime => { const img = window.TmdbAPI.getImageUrl(anime.poster_path, 'w500'); container.append(`<div class="item"><div class="product__item"><a href="anime-details.html?id=${anime.id}&tmdb=1"><div class="product__item__pic set-bg" style="background-image: url('${img}')"><div class="ep">${anime.vote_average.toFixed(1)}</div><div class="view"><i class="fa fa-play"></i></div></div></a><div class="product__item__text mt-3"><h5 class="text-truncate"><a href="anime-details.html?id=${anime.id}&tmdb=1">${anime.name || anime.title}</a></h5></div></div></div>`); }); container.owlCarousel({ loop: false, margin: 30, dots: false, nav: true, navText: ["<span class='arrow_carrot-left'></span>", "<span class='arrow_carrot-right'></span>"], responsive: { 0: { items: 2 }, 576: { items: 3 }, 992: { items: 4 }, 1200: { items: 5 } } }); }
    async function loadTrending() { renderSlider($('#trending-list'), await window.TmdbAPI.getTrendingAnime(1)); }
    async function loadPopular() { renderSlider($('#popular-list'), await window.TmdbAPI.getPopularAnime(1)); }
    async function loadGenreSections() { const container = $('#genre-sections-container'); const genres = [ { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 35, name: 'Comedy' }, { id: 28, name: 'Action' }, { id: 16, name: 'Animation' }, { id: 18, name: 'Drama' }, { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' } ]; for (const genre of genres) { const sectionId = `genre-list-${genre.id}`; container.append(`<div class="trending__product mt-5"><div class="section-title-wrap"><div class="section-title"><h4>${genre.name} Shows</h4></div><a href="categories.html?genre=${genre.id}" class="primary-btn">View All</a></div><div class="row"><div class="col-12"><div class="owl-carousel" id="${sectionId}"></div></div></div></div>`); renderSlider($(`#${sectionId}`), await window.TmdbAPI.getAnimeByGenre(genre.id, 1)); } }
    async function loadAnimeDetails(id) {
        const container = $('#anime-details-container'); let anime = await window.TmdbAPI.getDetails(id, 'tv') || await window.TmdbAPI.getDetails(id, 'movie'); if (!anime || anime.status_code === 34) { container.html('<div class="col-12 text-center text-white p-5">Anime not found.</div>'); return; }
        const title = anime.name || anime.title; const isMovie = !anime.number_of_seasons; $('body').css({ 'background': `linear-gradient(rgba(6,6,15,0.92), rgba(6,6,15,0.92)), url('${window.TmdbAPI.getImageUrl(anime.backdrop_path, 'original')}')`, 'background-size': 'cover', 'background-attachment': 'fixed', 'background-position': 'center' });
        container.html(`<div class="col-lg-3"><div class="product__item__pic set-bg" style="background-image: url('${window.TmdbAPI.getImageUrl(anime.poster_path, 'w500')}'); height:480px; border-radius:15px;"></div></div><div class="col-lg-9"><div class="anime__details__text"><div class="anime__details__title"><h2>${title}</h2><div class="mt-2 text-danger font-weight-bold">${isMovie ? 'Movie' : 'TV'} • ${anime.genres.map(g => g.name).join(', ')}</div><p class="mt-4" style="font-size:18px; line-height:1.8;">${anime.overview}</p></div><div class="anime__details__btn mt-4"><a href="anime-watching.html?id=${id}&tmdb=1&ep=1" class="site-btn"><i class="fa fa-play"></i> Watch Now</a><a href="https://vidvault.ru/${isMovie ? 'movie' : 'tv'}/${id}${isMovie ? '' : '/1/1'}" target="_blank" class="site-btn ml-3" style="background: #333;"><i class="fa fa-download"></i> Download</a><button class="bookmark-btn ml-3" id="lib-toggle" data-id="${id}" data-title="${title}" data-img="${anime.poster_path}"><i class="fa fa-heart"></i> Add to Library</button></div></div></div>`);
        updateLibButton(id); $('#lib-toggle').on('click', function() { toggleLibraryItem($(this).data()); });
        if (!isMovie) { const epSection = $('#episode-list').parent(); if (epSection.find('#season-selector').length === 0) { epSection.find('.section-title').append(`<div class="ml-auto d-flex align-items-center"><span class="mr-3 text-white-50 small">SEASON</span><select id="season-selector" class="glass-panel text-white" style="border:0; padding:5px 15px; border-radius:8px; cursor:pointer;">${Array.from({length: anime.number_of_seasons}, (_, i) => `<option value="${i+1}">Season ${i+1}</option>`).join('')}</select></div>`).addClass('d-flex align-items-center'); } loadEpisodes(id, 1, title); $(document).off('change', '#season-selector').on('change', '#season-selector', function() { loadEpisodes(id, $(this).val(), title); }); }
    }
    async function loadEpisodes(id, s, title) { const list = $('#episode-list').html('<div class="col-12 text-center p-4"><div class="spinner-border text-danger spinner-border-sm"></div></div>'); try { const episodes = await window.TmdbAPI.getTvSeasonEpisodes(id, s); list.empty(); if (!episodes || episodes.length === 0) { list.html('<div class="col-12 text-center text-white-50 p-4">No episodes found.</div>'); return; } episodes.forEach(ep => { list.append(`<div class="col-lg-12 mb-2"><div class="p-3 rounded glass-panel hover-bg d-flex align-items-center" style="background: rgba(255,255,255,0.03);"><a href="anime-watching.html?id=${id}&tmdb=1&s=${s}&ep=${ep.episode_number}" class="text-white flex-grow-1 font-weight-bold">Episode ${ep.episode_number}: ${ep.name || 'TBA'}</a><a href="https://vidvault.ru/tv/${id}/${s}/${ep.episode_number}" target="_blank" class="text-danger ml-3"><i class="fa fa-download"></i></a></div></div>`); }); } catch(e) { list.html('<div class="col-12 text-center text-white-50 p-4">Error loading episodes.</div>'); } }
    async function loadSidebarData() { await fetchSidebar('latest-completed-list', 'top/anime?filter=bypopularity', 1); await delay(1200); await fetchSidebar('top-upcoming-list', 'seasons/upcoming', 1); }
    async function fetchSidebar(containerId, endpoint, page, append = false) { try { const res = await fetch(`https://api.jikan.moe/v4/${endpoint}&page=${page}`); const json = await res.json(); const container = $(`#${containerId}`); if (!append) container.empty(); if (!json.data) return; json.data.slice(0, 10).forEach(anime => { container.append(`<div class="sidebar__item"><img src="${anime.images.jpg.image_url}"><div class="flex-grow-1"><h6><a href="categories.html?search=${encodeURIComponent(anime.title)}" class="text-white">${anime.title.substring(0, 25)}...</a></h6><p>${anime.type || 'TV'} • ${anime.status}</p></div></div>`); }); } catch(e) { console.error("Sidebar error", e); } }
    async function initNewsPage() { try { await delay(500); const res = await fetch('https://api.jikan.moe/v4/watch/episodes'); const json = await res.json(); const container = $('#news-container').empty(); if (!json.data || json.data.length === 0) { container.html('<div class="col-12 text-center text-white p-5">No news found.</div>'); return; } json.data.slice(0, 16).forEach(item => { container.append(`<div class="col-lg-3 col-md-4 col-6"><div class="blog__item set-bg" style="background-image: url('${item.entry.images.jpg.large_image_url}'); border-radius:15px; margin-bottom:30px; height: 350px;"><div class="blog__item__text"><p><span class="icon_calendar"></span> Just Released</p><h4><a href="categories.html?search=${encodeURIComponent(item.entry.title)}">${item.entry.title}</a></h4><div class="text-danger small font-weight-bold mt-2">${item.episodes[0].title}</div></div></div></div>`); }); } catch(e) { $('#news-container').html('<div class="col-12 text-center text-white">Error loading news.</div>'); } }
    async function initSchedule() { $('.day-tab').on('click', function(e) { e.preventDefault(); $('.day-tab').removeClass('active'); $(this).addClass('active'); loadSchedule($(this).data('day')); }); const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).toLowerCase(); $(`.day-tab[data-day="${today}"]`).addClass('active'); loadSchedule(today); }
    async function loadSchedule(day) { const list = $('#schedule-list').html('<div class="text-center p-5"><div class="spinner-border text-danger"></div></div>'); try { await delay(500); const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}`); const json = await res.json(); list.empty(); if (!json.data || json.data.length === 0) { list.html('<div class="text-center text-white">No releases today.</div>'); return; } json.data.forEach(anime => { list.append(`<div class="schedule-item"><div class="schedule-time">${anime.broadcast.time || 'TBA'}</div><div class="schedule-content"><img src="${anime.images.jpg.image_url}" style="width:50px; border-radius:8px; margin-right:20px;"><div class="flex-grow-1"><h5 class="text-white mb-1" style="font-size:16px;">${anime.title}</h5><div class="small text-danger">${anime.broadcast.day || day.toUpperCase()} • ${anime.episodes || '?'} EPs</div></div><a href="categories.html?search=${encodeURIComponent(anime.title)}" class="site-btn" style="padding: 5px 15px; font-size:12px;">Search</a></div></div>`); }); } catch(e) { list.html('<div class="text-center text-white">Error loading schedule.</div>'); } }
    async function loadRecommendations(id, type = 'tv') { const container = $('#recommendations-container').empty(); try { const data = await window.TmdbAPI.getRecommendations(id, type); const items = (!data || data.length === 0) ? (await window.TmdbAPI.getPopularAnime(1)).slice(0, 6) : data.slice(0, 6); items.forEach(anime => { container.append(`<div class="col-lg-4 col-md-6 col-6 mb-4"><div class="product__item"><a href="anime-details.html?id=${anime.id}&tmdb=1"><div class="product__item__pic set-bg" style="background-image: url('${window.TmdbAPI.getImageUrl(anime.poster_path, 'w342')}')"></div></a><div class="product__item__text"><h5 class="text-truncate" style="font-size:12px;"><a href="#">${anime.name || anime.title}</a></h5></div></div></div>`); }); } catch(e) { console.error("Recs error:", e); } }

})(jQuery);