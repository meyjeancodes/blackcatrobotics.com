import io, re

base = "/Users/megan/blackcatrobotics-repo/TechMedix-standalone"
SRC = f"{base}/public/index.html"
EMBED = f"{base}/preview-hero-acquire-embed-h1.html"

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

# Remove the PREVIOUS teardown band + its CSS before re-wiring (idempotent re-wire)
# 1) strip old embed CSS: a <style> block we injected has .teardown-embed rules.
#    Simplest robust approach: remove everything between the marker comment we added.
html = re.sub(r"\n\s*<!-- TECHMEDIX TEARDOWN BAND.*?(?=\n    <div class=\"tabs-bar\">)", "\n", html, flags=re.S)

# Old embed CSS: locate the <style> we appended that contains '.teardown-embed{'. Remove that whole <style> block.
def remove_injected_style(s):
    # find <style> blocks containing 'teardown-embed' and drop them
    out=[]
    idx=0
    while True:
        i=s.find('<style>', idx)
        if i==-1: break
        j=s.find('</style>', i)
        if j==-1: break
        block=s[i:j+len('</style>')]
        if 'teardown-embed' in block:
            # drop it
            s=s[:i]+s[j+len('</style>'):]
            idx=i
        else:
            idx=j+len('</style>')
    return s
html = remove_injected_style(html)

# 2) remove old embed JS (the script that defines const td=document.getElementById('acquire-teardown'))
#    It is the <script> containing "acquire-teardown" and our phases. Drop that <script>.
def remove_injected_script(s):
    out=[]
    idx=0
    while True:
        i=s.find('<script>', idx)
        if i==-1: break
        j=s.find('</script>', i)
        if j==-1: break
        block=s[i:j+len('</script>')]
        if 'acquire-teardown' in block and 'phases' in block:
            s=s[:i]+s[j+len('</script>'):]
            idx=i
        else:
            idx=j+len('</script>')
    return s
html = remove_injected_script(html)

# 3) inject fresh CSS into <head>
assert "</head>" in html, "no head close"
html = html.replace("</head>", embed_css + "\n</head>", 1)

# 4) inject fresh band HTML above the Acquire tabs
marker = '    <div class="tabs-bar">'
assert marker in html, "tabs-bar marker missing"
inject = "\n\n    <!-- TECHMEDIX TEARDOWN BAND (embed) -->\n" + embed_html + "\n\n"
html = html.replace(marker, inject + marker, 1)

# 5) close dangling script + append embed JS (live file was missing closers; keep them)
html = html.rstrip()
if "</body>" not in html:
    html = html + "\n</script>\n" + embed_js + "\n</body>\n</html>\n"

with io.open(SRC, "w", encoding="utf-8") as f:
    f.write(html)

print("RE-WIRED H1 into index.html")
print("teardown-embed:", html.count("teardown-embed"),
      "| unitree_h1 ref:", html.count("unitree_h1.jpg"),
      "| </head>:", html.count("</head>"),
      "| </body>:", html.count("</body>"),
      "| </html>:", html.count("</html>"),
      "| old h1 label 'KNEE ACTUATOR':", html.count("KNEE ACTUATOR"))
