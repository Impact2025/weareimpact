#!/usr/bin/env node
/**
 * Genereert de podcast-cover (3000x3000 JPEG) die Apple Podcasts en Spotify
 * verplicht stellen. Bestaande brand-assets zijn te klein en niet vierkant.
 *
 * Gebruik: node scripts/generate-podcast-cover.mjs
 * Output:  public/podcast-cover.jpg
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SIZE = 3000;
const SLATE = '#0f172a';
const ORANGE = '#ea580c';

const svg = `
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${SLATE}"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
  <circle cx="${SIZE * 0.85}" cy="${SIZE * 0.18}" r="${SIZE * 0.28}" fill="${ORANGE}" opacity="0.12"/>
  <circle cx="${SIZE * 0.12}" cy="${SIZE * 0.9}" r="${SIZE * 0.22}" fill="${ORANGE}" opacity="0.08"/>
  <rect x="${SIZE * 0.12}" y="${SIZE * 0.635}" width="${SIZE * 0.1}" height="18" fill="${ORANGE}"/>
  <text x="${SIZE * 0.12}" y="${SIZE * 0.6}" font-family="Arial, Helvetica, sans-serif"
        font-size="260" font-weight="bold" fill="#ffffff">WeAreImpact</text>
  <text x="${SIZE * 0.12}" y="${SIZE * 0.73}" font-family="Arial, Helvetica, sans-serif"
        font-size="130" font-weight="bold" fill="${ORANGE}">AI in het sociaal domein</text>
  <text x="${SIZE * 0.12}" y="${SIZE * 0.81}" font-family="Arial, Helvetica, sans-serif"
        font-size="96" fill="#94a3b8">Vincent van Munster</text>
</svg>`;

const logo = await sharp(readFileSync(join(root, 'public/WeAreImpact_hart.png')))
  .resize({ width: Math.round(SIZE * 0.3) })
  .toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: logo, top: Math.round(SIZE * 0.13), left: Math.round(SIZE * 0.12) }])
  .jpeg({ quality: 88 })
  .toFile(join(root, 'public/podcast-cover.jpg'));

const meta = await sharp(join(root, 'public/podcast-cover.jpg')).metadata();
console.log(`public/podcast-cover.jpg → ${meta.width}x${meta.height}, ${(meta.size / 1024).toFixed(0)} KB`);
