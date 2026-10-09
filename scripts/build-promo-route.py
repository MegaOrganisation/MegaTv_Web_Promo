# -*- coding: utf-8 -*-
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
promo_html_path = root / 'templates' / 'promo.html'
html_content = promo_html_path.read_text(encoding='utf-8')

route_ts_content = 'export const dynamic = "force-static";\n\nconst PROMO_HTML = ' + json.dumps(html_content, ensure_ascii=False) + ';\n\nexport function GET() {\n  return new Response(PROMO_HTML, {\n    headers: {\n      "Content-Type": "text/html; charset=utf-8"\n    }\n  });\n}\n'

target_route = root / 'src' / 'app' / 'route.ts'
target_route.write_text(route_ts_content, encoding='utf-8')
print("Successfully generated src/app/route.ts with size:", len(route_ts_content))
