// WebP conversie van profielfoto's en hero-afbeeldingen
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC = 'public';

const images = [
  { src: 'vincent-van-munster.png', dest: 'vincent-van-munster.webp', quality: 80, maxW: 864 },
  { src: 'Vincent van Munster WeAreImpact.png', dest: 'vincent-van-munster-weareimpact.webp', quality: 80, maxW: 864 },
  { src: 'WeAreImpact_hart.png', dest: 'weareimpact-hart.webp', quality: 85, maxW: 400 },
  { src: 'iris-avatar.png', dest: 'iris-avatar.webp', quality: 80, maxW: 400 },
  // OG images — allemaal naar WebP
  { src: 'og-homepage.png', dest: 'og-homepage.webp', quality: 85, maxW: 1200 },
  { src: 'og-ai-proof-checklist.png', dest: 'og-ai-proof-checklist.webp', quality: 85, maxW: 1200 },
  { src: 'og-ai-strategie-consultant.png', dest: 'og-ai-strategie-consultant.webp', quality: 85, maxW: 1200 },
  { src: 'og-ai-welzijn-expert.png', dest: 'og-ai-welzijn-expert.webp', quality: 85, maxW: 1200 },
  { src: 'og-change-management-digitale-transformatie.png', dest: 'og-change-management-digitale-transformatie.webp', quality: 85, maxW: 1200 },
  { src: 'og-impact-calculator.png', dest: 'og-impact-calculator.webp', quality: 85, maxW: 1200 },
  { src: 'og-programmamanager-digitale-transformatie.png', dest: 'og-programmamanager-digitale-transformatie.webp', quality: 85, maxW: 1200 },
];

async function main() {
  let totalSaved = 0;
  let totalOrig = 0;

  for (const img of images) {
    const srcPath = path.join(PUBLIC, img.src);
    const destPath = path.join(PUBLIC, img.dest);

    if (!fs.existsSync(srcPath)) {
      console.log(`⚠️  Skipping (not found): ${img.src}`);
      continue;
    }

    const origSize = fs.statSync(srcPath).size;
    totalOrig += origSize;

    let pipeline = sharp(srcPath);

    // Resize if larger than maxW, maintaining aspect ratio
    const meta = await pipeline.metadata();
    if (meta.width && meta.width > img.maxW) {
      pipeline = pipeline.resize({ width: img.maxW, withoutEnlargement: true });
    }

    await pipeline.webp({ quality: img.quality, effort: 6 }).toFile(destPath);

    const newSize = fs.statSync(destPath).size;
    const saved = origSize - newSize;
    totalSaved += saved;

    console.log(
      `✅ ${img.src.padEnd(55)} ${(origSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (bespaard ${(saved / 1024).toFixed(0)}KB / ${((saved / origSize) * 100).toFixed(0)}%)`
    );
  }

  console.log('\n───────────────────────────────────────────');
  console.log(`Totaal origineel: ${(totalOrig / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Totaal bespaard:  ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Percentage:       ${((totalSaved / totalOrig) * 100).toFixed(0)}%`);
}

main().catch(console.error);
