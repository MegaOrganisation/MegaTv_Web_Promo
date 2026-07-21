# -*- coding: utf-8 -*-
from pathlib import Path

raw = Path("src/app/route.ts").read_text(encoding="utf-8")

a_end = raw.find("\n\n\n<!-- ===== ECOSYSTEME ===== -->")
if a_end < 0:
    a_end = raw.find("\n<!-- ===== ECOSYSTEME ===== -->")
b_start = raw.find('<!-- ===== ACCOUNT / COMPANION ===== -->\\n')
if a_end < 0 or b_start < 0:
    raise SystemExit(f"markers not found a_end={a_end} b_start={b_start}")

eco_raw = raw[a_end:b_start]
lines = eco_raw.splitlines()
# Drop leading empty lines
while lines and lines[0].strip() == "":
    lines.pop(0)
# Join as escaped newlines for JS string content
eco_escaped = "\\n".join(lines)
if not eco_escaped.startswith("\\n"):
    eco_escaped = "\\n" + eco_escaped

prefix = raw[:a_end]
suffix = raw[b_start:]
# prefix should still be inside the open string ending after pricing </section>\n\n
# Ensure we close the gap cleanly: pricing ends with </section>\n\n then eco then account
new = prefix + eco_escaped + "\\n" + suffix
Path("src/app/route.ts").write_text(new, encoding="utf-8")
print("fixed", Path("src/app/route.ts").stat().st_size)
print("lines", new.count("\n") + 1)
print("has export", "export function GET" in new)
# sanity: first line after const should not be bare HTML
first_lines = new.splitlines()[:8]
for i, l in enumerate(first_lines, 1):
    print(f"{i}: {l[:100]}")
