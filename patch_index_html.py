import os

with open('index.html', 'r') as f:
    code = f.read()

old_head = """    <link rel="icon" type="image/png" href="/icon-192x192.png" />
    <link rel="apple-touch-icon" href="/icon-192x192.png" />
    <meta name="theme-color" content="#2563eb" />
    <title>Katalog Apotek Assyifa Farma Cideres</title>"""

new_head = """    <link rel="icon" type="image/png" href="/icon-192x192.png" />
    <link rel="apple-touch-icon" href="/icon-192x192.png" />
    <meta name="theme-color" content="#2563eb" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Assyifa" />
    <title>Katalog Apotek Assyifa Farma Cideres</title>"""

if old_head in code:
    code = code.replace(old_head, new_head)
    print("Patched index.html")
else:
    print("Could not patch index.html")

with open('index.html', 'w') as f:
    f.write(code)
