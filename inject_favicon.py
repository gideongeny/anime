import os, glob

for f in glob.glob('*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '<link rel="shortcut icon"' not in content:
        content = content.replace('</head>', '    <link rel="shortcut icon" href="img/favicon.png" type="image/x-icon">\n</head>')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Added favicon to {f}")
