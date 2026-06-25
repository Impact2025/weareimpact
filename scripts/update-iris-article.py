import json, requests, sys, yaml

# Read file
with open(r'D:\APPS\weareimpact\content\kennisbank\hoe-iris-lego-serious-play-ai-implementatie-welzijn-angst-eigenaarschap.md', 'r', encoding='utf-8') as f:
    raw = f.read()

# Split frontmatter
parts = raw.split('---', 2)
if len(parts) < 3:
    print('Invalid frontmatter')
    sys.exit(1)

frontmatter = yaml.safe_load(parts[1])
content = parts[2].strip()

# Build update payload
payload = {
    'id': '528df176-1ef7-4a71-a446-72b1f8aa94d4',
    'title': frontmatter.get('title', ''),
    'slug': frontmatter.get('slug', ''),
    'subtitle': frontmatter.get('subtitle'),
    'excerpt': frontmatter.get('excerpt', ''),
    'content': content,
    'category_slug': frontmatter.get('category_slug', 'algemeen'),
    'tags': frontmatter.get('tags', []),
    'seo_title': frontmatter.get('seo_title'),
    'seo_description': frontmatter.get('seo_description'),
    'seo_keywords': frontmatter.get('seo_keywords', []),
    'reading_time': frontmatter.get('reading_time', 8),
    'difficulty': frontmatter.get('difficulty', 'beginner'),
    'author_name': frontmatter.get('author_name', 'Vincent van Munster'),
    'author_title': frontmatter.get('author_title', 'Strategic Innovation Partner, WeAreImpact'),
    'lead_magnet_title': frontmatter.get('lead_magnet_title'),
    'lead_magnet_description': frontmatter.get('lead_magnet_description'),
    'lead_magnet_type': frontmatter.get('lead_magnet_type'),
    'faq_items': frontmatter.get('faq_items', []),
    'published_at': frontmatter.get('published_at'),
}

# PUT to admin endpoint
resp = requests.put(
    'https://weareimpact.nl/api/admin/kennisbank/528df176-1ef7-4a71-a446-72b1f8aa94d4',
    json=payload,
    headers={'Content-Type': 'application/json'},
    timeout=30
)

print(f'Status: {resp.status_code}')
result = resp.json()
print(json.dumps(result, indent=2))
