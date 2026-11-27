# 공식 사이트(46saju.com) 로고(157x66, 투명 PNG)를 5배로 키우고 가장자리를 다듬어 영상용 로고를 만든다.
from PIL import Image, ImageFilter, ImageChops
src = Image.open('mainLogo.png').convert('RGBA')
S = 5
a = src.split()[3].resize((src.width*S, src.height*S), Image.LANCZOS)
a = a.filter(ImageFilter.GaussianBlur(2.2))
a = a.point(lambda v: 0 if v < 96 else (255 if v > 160 else int((v-96)*255/64)))  # 부드러운 문턱값 → 매끈한 붓 가장자리
pad = 40
W, H = a.width + pad*2, a.height + pad*2
mask = Image.new('L', (W, H), 0); mask.paste(a, (pad, pad))
def make(fill, stroke, stroke_w, shadow, name):
    out = Image.new('RGBA', (W, H), (0,0,0,0))
    if shadow:
        sh = mask.filter(ImageFilter.MaxFilter(stroke_w*2+1)).filter(ImageFilter.GaussianBlur(10))
        layer = Image.new('RGBA', (W, H), (0,0,0,170)); layer.putalpha(ImageChops.multiply(sh, Image.new('L',(W,H),170)))
        out.alpha_composite(layer, (6, 10))
    if stroke:
        st = mask.filter(ImageFilter.MaxFilter(stroke_w*2+1)).filter(ImageFilter.GaussianBlur(1))
        layer = Image.new('RGBA', (W, H), stroke); layer.putalpha(st); out.alpha_composite(layer)
    layer = Image.new('RGBA', (W, H), fill); layer.putalpha(mask); out.alpha_composite(layer)
    out.save(name); print(name, out.size)
make((255,255,255,255), (40,20,10,255), 5, True, 'logo_white.png')
make((255,212,0,255), (60,30,10,255), 6, True, 'logo_gold.png')
make((20,20,20,255), None, 0, False, 'logo_black.png')
make((15,15,15,255), (255,255,255,235), 7, True, 'logo_black_glow.png')
