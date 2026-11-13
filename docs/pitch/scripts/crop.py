"""Crops the golden-path captures into the pieces the deck uses. Prints each output's size."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(HERE, "..", "captures", "shots")
O = os.path.join(HERE, "..", "captures", "crops")
os.makedirs(O, exist_ok=True)


def save(name, im):
    p = os.path.join(O, name)
    im.save(p, optimize=True)
    print(f"{name}: {im.size[0]}x{im.size[1]} {os.path.getsize(p)} bytes")


# Compare: the cooling finding, whole.
save("finding.png", Image.open(os.path.join(S, "02b-finding-cooling-1280.png")))

# Review: the approved card, split into its head (status, title, scope, steps) and its tail
# (source quotes, confirmed by, approved by). Fractions calibrated on the 1280-wide capture.
card = Image.open(os.path.join(S, "05b-card-approved-1280.png"))
W, H = card.size
save("card-top.png", card.crop((0, 0, W, int(H * 0.350))))
save("card-bottom.png", card.crop((0, int(H * 0.748), W, int(H * 0.916))))

# Ask: the two phone panels, whole.
save("ask-answer.png", Image.open(os.path.join(S, "07b-ask-answer-panel-375.png")))
save("ask-refusal.png", Image.open(os.path.join(S, "08b-ask-refusal-panel-375.png")))

# Compare: both sources before the click, whole page at 1280.
save("compare-sources.png", Image.open(os.path.join(S, "01-compare-sources-1280.png")))
