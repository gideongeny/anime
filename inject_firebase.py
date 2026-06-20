import os, glob

for f in glob.glob('*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '<script type="module" src="js/firebase-config.js"></script>' not in content:
        content = content.replace('<script src="js/main.js"></script>', '<script type="module" src="js/firebase-config.js"></script>\n    <script src="js/main.js"></script>')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated {f}")
