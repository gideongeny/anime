# 🎌 AnimeFlow - Premium Anime Streaming Platform

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Status](https://img.shields.io/badge/Status-Live-green.svg) ![API](https://img.shields.io/badge/API-Jikan_v4-red.svg)

> An ultra-premium, dynamic anime streaming experience built with modern web technologies and a glassmorphism aesthetic.

**AnimeFlow** transforms a static template into a fully functional, commercial-grade streaming platform. It leverages the **Jikan API** (MyAnimeList) to fetch real-time data, giving users access to the latest trending, popular, and upcoming anime without needing a complex backend.

---

## ✨ Features

### 🚀 Dynamic Core
- **Real-Time Data**: Powered by the [Jikan REST API](https://jikan.moe/), fetching live data for Top Anime, Season Now, and Upcoming releases.
- **Client-Side Rendering**: Optimized JavaScript architecture to dynamically populate the UI, reducing server load and improving interactivity.
- **Search Functionality**: Deep search integration allowing users to find any anime in the MAL database.

### 🎥 Immersive Viewing Experience
- **Custom Player Integration**: Built on top of **Plyr** for a sleek, responsive video playback experience.
- **Source Management**: `StreamManager` service architecture designed to handle multiple video sources (HLS, MP4, Embeds).
- **Episode Navigation**: Dynamic episode fetching and navigation for seamless binge-watching.

### 💎 Ultra-Premium UI/UX
- **Glassmorphism Design**: A modern, frosted-glass aesthetic with deep gradients and blurred backdrops (`backdrop-filter`).
- **Neon Accents**: Subtle neon glows and hover effects that create a "luxury-tech" feel.
- **Responsive Layout**: Fully responsive design using Bootstrap 4 grid, ensuring a perfect experience on Desktop, Tablet, and Mobile.
- **Commercial Ready**: Integrated Ad Slots (Banner & Sidebar) designed to maximize revenue without intrusive UX.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Custom Properties & Animations), JavaScript (ES6+)
- **Libraries**: jQuery, Bootstrap 4, Plyr.io, OwlCarousel
- **API**: Jikan API v4 (Unofficial MyAnimeList API)
- **Deployment**: Static Web Host / GitHub Pages ready

---

## 📸 Screenshots

| Homepage (Glassmorphism) | Dynamic Player |
|:---:|:---:|
| <!-- Insert Screenshot URL --> | <!-- Insert Screenshot URL --> |

---

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gideongeny/anime.git
   cd anime
   ```

2. **Open in Browser**
   Simply open `index.html` in your preferred web browser. No compilation step required!
   _Tip: Use "Live Server" in VS Code for the best development experience._

3. **Customize**
   - **Stream Sources**: Edit `js/stream-manager.js` to connect to your own video backend or API.
   - **Styling**: Modify `css/style.css` to tweak the JQuery/Glassmorphism variables.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

_Crafted with ❤️ for the Anime Community._
