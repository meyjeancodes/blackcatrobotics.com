import re, sys

SRC = "/Users/megan/blackcatrobotics-repo/TechMedix-standalone/preview-hero-option1-svg-teardown.html"
OUT = sys.argv[1]   # output html path
THEME = sys.argv[2] # theme name

# Theme palettes: (steel0,steel1,steel2, lite0,lite1,lite2, dark0,dark1,dark2,
#                 joint0,joint1,joint2, stroke, detail, accent, accent2, jointstyle, seam, vent)
T = {
  "consumer": ("#eef0f5","#c8cdd8","#a3a9b6","#f7f9fc","#d4d9e2","#b0b6c2","#bcc1cc","#8e94a1","#6e7480",
               "#d3d8e1","#aab0bd","#888ea0","#5a5f6b","#aeb3c0","#ff5a1f","#ff8a3a","flush",True,False),
  "medical":  ("#f5f7fb","#dde2ec","#c0c6d2","#ffffff","#e9edf4","#ccd2de","#d4d9e3","#aab0bd","#888ea0",
               "#e9ecf3","#c6cbd7","#a4a9b6","#9aa0ac","#c6cbd6","#36b3c7","#7fd8e6","flush",True,False),
  "combat":    ("#3a3d47","#1c1e25","#0c0d11","#4a4e5b","#2a2d35","#16181d","#21232b","#0e0f14","#06070a",
               "#ff5a1f","#cc3d17","#8c2a0e","#06070a","#5a5e6b","#ff5a1f","#ff8a3a","sharp",True,True),
  "sleekdark": ("#2e313b","#191b21","#0c0d11","#3e424d","#262930","#15171c","#1a1c22","#0e0f14","#06070a",
               "#3a3d47","#262930","#15171c","#06070a","#6a6e7c","#ff5a1f","#ff8a3a","flush",True,True),
}
s = T[THEME]
(st0,st1,st2, li0,li1,li2, dk0,dk1,dk2, j0,j1,j2, stroke, detail, acc, acc2, jstyle, seam, vent) = s

html = open(SRC, encoding="utf-8").read()

# Replace the <defs> gradient stops. Match each gradient by id and rewrite its stops.
def repl_grad(m):
    gid = m.group(1)
    if gid == "steelG":   return f'<linearGradient id="steelG" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0" stop-color="{st0}"/><stop offset=".5" stop-color="{st1}"/><stop offset="1" stop-color="{st2}"/>\n    </linearGradient>'
    if gid == "steelLite":return f'<linearGradient id="steelLite" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="{li0}"/><stop offset=".5" stop-color="{li1}"/><stop offset="1" stop-color="{li2}"/>\n    </linearGradient>'
    if gid == "darkG":    return f'<linearGradient id="darkG" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="{dk0}"/><stop offset=".5" stop-color="{dk1}"/><stop offset="1" stop-color="{dk2}"/>\n    </linearGradient>'
    if gid == "bronzeG":  return f'<linearGradient id="bronzeG" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0" stop-color="{j0}"/><stop offset=".5" stop-color="{j1}"/><stop offset="1" stop-color="{j2}"/>\n    </linearGradient>'
    if gid == "coreG":    return f'<linearGradient id="coreG" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0" stop-color="{acc2}"/><stop offset="1" stop-color="{acc}"/>\n    </linearGradient>'
    return m.group(0)
html = re.sub(r'<linearGradient id="(steelG|steelLite|darkG|bronzeG|coreG)"[^>]*>.*?</linearGradient>', repl_grad, html, flags=re.S)

# Replace outline stroke color #0c0d11 -> stroke, and secondary detail #9a9aa8 -> detail
html = html.replace('#0c0d11', stroke)
html = html.replace('#9a9aa8', detail)
html = html.replace('stroke="#6a6e7c"', f'stroke="{detail}"')
# bronze joint accent rings used cc3d17/ff5a1f -> keep accent but for consumer/medical soften
html = html.replace("stroke=\"#cc3d17\"", f"stroke=\"{acc}\"")
html = html.replace("stroke=\"#ff5a1f\"", f"stroke=\"{acc2}\"")
html = html.replace("fill=\"#ff5a1f\"", f"fill=\"{acc2}\"")
html = html.replace("fill=\"#cc3d17\"", f"fill=\"{acc}\"")
# glint
html = html.replace(".glint{fill:#cc3d17;}", f".glint{{fill:{acc};}}")

# Joint style: 'flush' -> smaller, less medieval. Tweak bronze joint outer r=20 circles:
# make them subtler by reducing stroke emphasis is hard via regex; instead swap the
# bronze outer ring accent color already done. Add emissive seam lines if seam.
if seam:
    # thin glowing accent seam down each limb + torso centerline
    seam_svg = f'''
  <!-- emissive seam accents -->
  <g stroke="{acc}" stroke-width="1" opacity=".55" fill="none" stroke-linecap="round" pointer-events="none">
    <path d="M230 132 L230 196"/>
    <path d="M166 172 L166 220"/><path d="M294 172 L294 220"/>
    <path d="M205 300 L205 388"/><path d="M255 300 L255 388"/>
    <path d="M200 410 L200 508"/><path d="M260 410 L260 508"/>
  </g>'''
    # inject just before </svg>
    html = html.replace("</svg>", seam_svg + "\n</svg>", 1)

open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, "theme", THEME)
