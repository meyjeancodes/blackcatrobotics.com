import io

base = "/Users/megan/blackcatrobotics-repo/TechMedix-standalone"
SRC = f"{base}/public/index.html"
EMBED = f"{base}/preview-hero-acquire-embed.html"

def read(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()

html = read(SRC)
embed = read(EMBED)

def between(s, start, end, incl_start=False, incl_end=False):
    i = s.index(start)
    j = s.index(end, i)
    a = i if incl_start else i + len(start)
    b = j + len(end) if incl_end else j
    return s[a:b]

embed_css = between(embed, "<style>", "</style>", True, True)
embed_html = between(embed, '<section class="teardown-embed"', "<script>", incl_start=True)
embed_js = between(embed, "<script>", "</script>", True, True)

# 1) inject CSS into <head>
assert "</head>" in html, "no head close"
html = html.replace("</head>", embed_css + "\n</head>", 1)

# 2) inject the band HTML above the Acquire tabs
marker = '    <div class="tabs-bar">'
assert marker in html, "tabs-bar marker missing"
inject = "\n\n    <!-- TECHMEDIX TEARDOWN BAND (embed) -->\n" + embed_html + "\n\n"
html = html.replace(marker, inject + marker, 1)

# 3) the live file is missing its final </script> + </body></html>; close it and append embed JS
html = html.rstrip()
html = html + "\n</script>\n" + embed_js + "\n</body>\n</html>\n"

with io.open(SRC, "w", encoding="utf-8") as f:
    f.write(html)

print("WIRED INTO index.html")
print("teardown-embed:", html.count("teardown-embed"),
      "| </head>:", html.count("</head>"),
      "| </script>:", html.count("</script>"),
      "| </body>:", html.count("</body>"),
      "| </html>:", html.count("</html>"))
