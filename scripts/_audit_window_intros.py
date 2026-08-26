#!/usr/bin/env python3
"""READ-ONLY: toon van elke weareimpact-blog in de window de eerste <p>-inhoud,
zodat we zien of de intro echt ontbreekt/leeg is. Schrijft NIETS."""
import os, re, sys
from dotenv import load_dotenv
load_dotenv(".env.local")
db = os.getenv("DATABASE_URL") or os.getenv("NEON_URL") or os.getenv("POSTGRES_URL")
try:
    import psycopg2 as pg
except ImportError:
    import psycopg as pg
conn = pg.connect(db) if 'psycopg2' in sys.modules else pg.connect(db)
cur = conn.cursor()
cur.execute("""
    SELECT slug, title, published_at, content, excerpt
    FROM posts
    WHERE status='published'
      AND published_at BETWEEN '2025-12-12' AND '2026-06-08 23:59:59'
    ORDER BY published_at DESC
""")
rows = cur.fetchall()
print(f"Blogs in window: {len(rows)}\n")
for slug, title, pub, content, excerpt in rows:
    ps = re.findall(r"<p[^>]*>(.*?)</p>", content or "", re.S)
    first = re.sub(r"<[^>]+>", "", ps[0]).strip() if ps else "(GEEN <p>)"
    first = first[:90]
    has_lead = bool(first)
    flag = "" if has_lead else "  <<< INTRO ONTBREEKT"
    print(f"[{str(pub)[:10]}] {title[:42]}{flag}")
    print(f"    eerste p: {first}")
cur.close(); conn.close()
