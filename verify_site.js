
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log("Navigating to http://localhost:3000/index.html");
    try {
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });
        const title = await page.title();
        console.log("Page Title:", title);

        // Check for content
        const trendingCount = await page.locator('#trending-list .product__item').count();
        console.log("Trending items found:", trendingCount);

        await page.screenshot({ path: 'local_check.png' });
    } catch (e) {
        console.log("Navigation failed:", e.message);
    } finally {
        await browser.close();
    }
})();
