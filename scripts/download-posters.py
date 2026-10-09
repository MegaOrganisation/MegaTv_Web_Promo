# -*- coding: utf-8 -*-
import urllib.request
import json
from pathlib import Path

# read .env.local
env = {}
for line in Path('.env.local').read_text(encoding='utf-8').splitlines():
    if '=' in line and not line.startswith('#'):
        k, v = line.split('=', 1)
        env[k.strip()] = v.strip().strip('"').strip("'")

sb_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
anon_key = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

movies = [
    ('Encanto', 'poster-encanto.jpg'),
    ('Interstellar', 'poster-interstellar.jpg'),
    ('Spider-Man Across the Spider-Verse', 'poster-spiderverse.jpg'),
    ('Oppenheimer', 'poster-oppenheimer.jpg'),
    ('Dune: Part Two', 'poster-dune2.jpg'),
    ('Avatar: The Way of Water', 'poster-avatar.jpg')
]

for query, filename in movies:
    endpoint = f"{sb_url}/functions/v1/tmdb-proxy?path=/search/movie&query={urllib.parse.quote(query)}"
    req = urllib.request.Request(endpoint, headers={
        'apikey': anon_key,
        'Authorization': f"Bearer {anon_key}",
        'User-Agent': 'Mozilla/5.0'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            results = data.get('results', [])
            if results and results[0].get('poster_path'):
                p_path = results[0]['poster_path']
                img_url = f"https://image.tmdb.org/t/p/w780{p_path}"
                out_path = Path('public/assets/posters') / filename
                urllib.request.urlretrieve(img_url, out_path)
                print(f"Downloaded {filename}: {img_url} ({out_path.stat().st_size} bytes)")
    except Exception as e:
        print(f"Error for {query}: {e}")
