const fs = require('fs');
['categories.html', 'anime-details.html', 'anime-watching.html'].forEach(f => {
    let h = fs.readFileSync(f, 'utf8');
    h = h.replace(/<div class="col-lg-8">/g, '<div class="col-lg-12">');
    h = h.replace(/<div class="col-lg-4 col-md-6 col-sm-8">/g, '<div class="col-lg-4 col-md-6 col-sm-8" style="display:none;">');
    h = h.replace(/<div class="col-lg-4 col-md-4">/g, '<div class="col-lg-4 col-md-4" style="display:none;">');
    h = h.replace(/<div class="col-lg-4">/g, '<div class="col-lg-4" style="display:none;">');
    fs.writeFileSync(f, h);
    console.log('Updated ' + f);
});
