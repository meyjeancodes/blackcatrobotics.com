import io

base = "/Users/megan/blackcatrobotics-repo/TechMedix-standalone"

def read(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()

html = read(f"{base}/public/index.html")
embed = read(f"{base}/preview-hero-acquire-embed.html")

def between(s, start, end, incl_start=False, incl_end=False):
    i = s.index(start)
    j = s.index(end, i)
    a = i if incl_start else i + len(start)
    b = j + len(end) if incl_end else j
    return s[a:b]

embed_css = between(embed, "<style>", "</style>", True, True)
# capture the section AND the rail/hud/hint divs that sit outside it (everything up to <script>)
embed_html = between(embed, '<section class="teardown-embed"', "<script>", incl_start=True)
embed_js = between(embed, "<script>", "</script>", True, True)

assert "</head>" in html, "no head close"
html = html.replace("</head>", embed_css + "\n</head>", 1)

marker = '    <div class="tabs-bar">'
assert marker in html, "tabs-bar marker missing"
inject = "\n\n    <!-- TECHMEDIX TEARDOWN BAND (embed) -->\n" + embed_html + "\n\n"
html = html.replace(marker, inject + marker, 1)

# The live file is missing its final </script> (ends mid-JS). Close any dangling
# script block, then append the embed as a fresh script + proper document closers.
html = html.rstrip()
html = html + "\n</script>\n" + embed_js + "\n</body>\n</html>\n"

with io.open(f"{base}/_test-acquire-injected.html", "w", encoding="utf-8") as f:
    f.write(html)

print("OK | teardown-embed:", html.count("teardown-embed"),
      "| hint id:", html.count('id="hint"'),
      "| hud id:", html.count('id="hud"'),
      "| </script>:", html.count("</script>"),
      "| </body>:", html.count("</body>"))
