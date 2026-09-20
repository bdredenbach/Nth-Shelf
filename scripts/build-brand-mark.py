"""Build crisp brand source and Android vector from paths, not a resized bitmap.
Requires fontTools and the DejaVu Sans Condensed Bold font (license in notices).
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from xml.sax.saxutils import escape
root=Path(__file__).resolve().parent.parent
font=TTFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
glyphs=font.getGlyphSet();cmap=font.getBestCmap();units=font['head'].unitsPerEm
parts=[]
def path(d,fill='#ed2029',stroke=None,sw=0):parts.append((d,fill,stroke,sw))
def text(value,x,y,width,height):
 advance=sum(glyphs[cmap[ord(c)]].width for c in value);sx=width/advance;sy=height/units
 pen=SVGPathPen(glyphs)
 for c in value:
  name=cmap[ord(c)];glyphs[name].draw(TransformPen(pen,(sx,0,0,-sy,x,y)));x+=glyphs[name].width*sx
 path(pen.getCommands())
# Established red outlined N/books on a horizontal shelf.
path('M112 204H400',stroke='#ed2029',fill='none',sw=8)
path('M130 201V77H150L195 151V201H178L150 155V201Z',stroke='#ed2029',fill='none',sw=7)
path('M198 201V32H237V201M199 55H236M211 70V184',stroke='#ed2029',fill='none',sw=7)
path('M244 201V63H281V201M245 83H280M257 100V178',stroke='#ed2029',fill='none',sw=7)
path('M288 201V32H319V201M289 54H318M300 72V181',stroke='#ed2029',fill='none',sw=7)
path('M333 67L363 59L396 190L365 199ZM338 88L368 80M360 177L390 169',stroke='#ed2029',fill='none',sw=7)
text('N',78,310,58,110);text('th',142,266,37,46)
path('M143 278H180',stroke='#ed2029',fill='none',sw=3)
text('SHELF',188,310,252,110)
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 340" role="img" aria-label="Nth Shelf">'+''.join(f'<path d="{d}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"' if stroke else '')+'/>' for d,fill,stroke,sw in parts)+'</svg>\n'
(root/'assets/nth-shelf-brand.svg').write_text(svg)
# Android paths share the exact same geometry. Viewport gives the mark breathing room.
xml='<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="512dp" android:height="340dp" android:viewportWidth="512" android:viewportHeight="340">\n'
for d,fill,stroke,sw in parts:
 xml+=f'    <path android:pathData="{escape(d)}" android:fillColor="'+('#00000000' if fill=='none' else fill)+'"'+(f' android:strokeColor="{stroke}" android:strokeWidth="{sw}" android:strokeLineCap="round" android:strokeLineJoin="round"' if stroke else '')+' />\n'
xml+='</vector>\n';(root/'android/app/src/main/res/drawable/nth_shelf_brand.xml').write_text(xml)
print('SVG and Android vector use identical outlined brand paths.')
