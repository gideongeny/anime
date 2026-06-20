const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const scripts = `<script src="js/jquery-3.3.1.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/player.js"></script>
    <script src="js/jquery.nice-select.min.js"></script>
    <script src="js/mixitup.min.js"></script>
    <script src="js/jquery.slicknav.js"></script>
    <script src="js/owl.carousel.min.js"></script>
    <script src="js/tmdb-api.js"></script>
    <script type="module" src="js/firebase-config.js"></script>
    <script src="js/main.js"></script>`;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/<script src="js\/jquery-3\.3\.1\.min\.js"><\/script>[\s\S]*?<script src="js\/main\.js"><\/script>/, scripts);
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
});
