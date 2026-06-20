import os, re
header_html = '''    <header class="header">
        <div class="container">
            <div class="row">
                <div class="col-lg-2">
                    <div class="header__logo">
                        <a href="./index.html"><h3 style="color: #fff; font-weight: 800;">Ani<span style="color: #ff2d55;">me</span></h3></a>
                    </div>
                </div>
                <div class="col-lg-8">
                    <div class="header__nav">
                        <nav class="header__menu mobile-menu">
                            <ul>
                                <li class="{idx}"><a href="./index.html">Homepage</a></li>
                                <li class="{cat}"><a href="./categories.html">Categories <span class="arrow_carrot-down"></span></a>
                                    <ul class="dropdown">
                                        <li><a href="./categories.html">Categories</a></li>
                                        <li><a href="./anime-details.html">Anime Details</a></li>
                                        <li><a href="./anime-watching.html">Anime Watching</a></li>
                                        <li><a href="./signup.html">Sign Up</a></li>
                                        <li><a href="./login.html">Login</a></li>
                                    </ul>
                                </li>
                                <li class="{sch}"><a href="./schedule.html">Schedule</a></li>
                                <li class="{nws}"><a href="./blog.html">News</a></li>
                                <li class="{lib}"><a href="./history.html">Library</a></li>
                                <li class="{con}"><a href="./contact.html">Contacts</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <div class="col-lg-2">
                    <div class="header__right">
                        <a href="#" class="search-switch"><span class="icon_search"></span></a>
                        <a href="./login.html"><span class="icon_profile"></span></a>
                    </div>
                </div>
            </div>
            <div id="mobile-menu-wrap"></div>
        </div>
    </header>'''

pages = {
    'index.html': 'idx', 'categories.html': 'cat', 'anime-details.html': 'cat',
    'anime-watching.html': 'cat', 'schedule.html': 'sch', 'blog.html': 'nws',
    'blog-details.html': 'nws', 'contact.html': 'con', 'history.html': 'lib',
    'login.html': '', 'signup.html': ''
}

for p, cls in pages.items():
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f: content = f.read()
        cur_header = header_html.format(idx='active' if cls=='idx' else '', 
                                       cat='active' if cls=='cat' else '',
                                       sch='active' if cls=='sch' else '',
                                       nws='active' if cls=='nws' else '',
                                       lib='active' if cls=='lib' else '',
                                       con='active' if cls=='con' else '')
        content = re.sub(r'<header.*?</header>', cur_header, content, flags=re.DOTALL)
        with open(p, 'w', encoding='utf-8') as f: f.write(content)
print("Headers standardized.")
