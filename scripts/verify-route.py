# -*- coding: utf-8 -*-
from pathlib import Path

t = Path("src/app/route.ts").read_text(encoding="utf-8")
print("len", len(t))
checks = [
    "ecosysteme",
    "features",
    "ACCOUNT",
    "pricing",
    "footer",
    "megatv-auth-site",
    "/api/download/android",
    "Découvrir MegaTv",
    "export function GET",
]
for c in checks:
    print(c, c in t)
# Find if HTML was truncated - look for closing html
print("closes html", "</html>" in t)
print("tail", repr(t[-300:]))
