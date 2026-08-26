#!/usr/bin/env python3
"""READ-ONLY: inventariseer weareimpact-blogs in de window 12-12-2025 .. 8-6-2026
en check of de content een intro-paragraaf heeft. Schrijft NIETS."""
import os, re, sys
from dotenv import load_dotenv
load_dotenv(".env.local")
db = os.getenv("DATABASE_URL") or os.getenv("NEON_URL") or os.getenv("POSTGRES_URL")
if not db:
    print("GEEN DB-URL"); sys.exit(1)
try:
    import psycopg2 as pg
except ImportError:
    import psycopg as pg  # type: ignore
conn = pg.connect(db) if 'psycopg2' in sys.modules else pg.connect(db)
cur = conn.cursor()
cur.execute("""
    SELECT id, slug, title, published_at, excerpt,
           length(content) AS clen,
          (content LIKE '<p%' OR content LIKE '%<p%') AS has_p
    FROM posts
    WHERE status='published'
      AND published_at BETWEEN '2025-12-12' AND '2026-06-08 23:59:59'
    ORDER BY published_at DESC
""")
rows = cur.fetchall()
print(f"Blogs in window: {len(rows)}\n")
for r in rows:
    pid, slug, title, pub, excerpt, clen, has_p = r
    # eerste <p> tekst
    m = re.search(r"<p[^>]*>(.*?)</p>", (excerpt or ""), re.S)
    print(f"  {str(pub)[:10]}  p={has_p} len={clen}  {title[:50]}")
    print(f"     slug: {slug}")
cur.close(); conn.close()
PY