"""Subset the downloaded Mona Sans font for the portfolio (requires fonttools[woff]).

Usage: python scripts/optimize-font.py original.woff2 output.woff2
Original: https://fonts.gstatic.com/s/monasans/v4/o-0IIpQmx24alC5A4PNr5TRA.woff2
Preserves all supplied characters and the weight/width ranges used by the site.
The derivative is renamed in accordance with the font's reserved-name license.
"""
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

font = TTFont(sys.argv[1])
font = instantiateVariableFont(font, {"wdth": (100, 100, 125), "wght": (400, 400, 900)})
options = subset.Options()
options.layout_features = ["kern", "liga", "clig", "ss01"]
options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=font.getBestCmap().keys())
subsetter.subset(font)
for record in font["name"].names:
    if record.nameID in (1, 3, 4, 6, 16):
        name = "PortfolioSans" if record.nameID == 6 else "Portfolio Sans"
        record.string = name.encode(record.getEncoding())
font.flavor = "woff2"
font.save(sys.argv[2])
