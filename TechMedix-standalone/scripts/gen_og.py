from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
INK = (10, 10, 15)
FIRE = (204, 61, 23)
PAPER = (240, 239, 232)
WHITE = (255, 255, 255)
GREY = (136, 136, 160)

img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)

def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Tanker-Regular.ttf",
        "/Library/Fonts/Tanker-Regular.ttf",
        "/System/Library/Fonts/Supplemental/Satoshi-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                continue
    return ImageFont.load_default()

# subtle fire glow block bottom-right
d.rectangle([W-640, H-360, W, H], fill=(22, 12, 9))

# eyebrow
eb = font(22)
d.text((80, 90), "BLACKCAT ROBOTICS", font=eb, fill=FIRE)

# headline (Tanker-like serif fallback)
head = font(86)
d.text((78, 150), "Predictive maintenance", font=head, fill=WHITE)
d.text((78, 250), "& fleet intelligence", font=head, fill=WHITE)
d.text((78, 350), "for autonomous robots.", font=head, fill=FIRE)

# subline
sub = font(28)
d.text((80, 470), "TechMedix AI predicts robot failures up to 48 hours before they happen.", font=sub, fill=(200, 200, 210))

# wordmark bottom-left
wm = font(30)
d.text((80, 560), "TechMedix", font=wm, fill=WHITE)

os.makedirs("public", exist_ok=True)
img.save("public/og-techmedix.png")
print("wrote public/og-techmedix.png", img.size)
