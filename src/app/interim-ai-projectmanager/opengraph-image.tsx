import { renderAiPmOg, ogForPage } from '@/lib/ai-pm-og';

export const runtime = 'edge';
export const alt = 'WeAreImpact: interim-ai-projectmanager';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderAiPmOg(ogForPage('interim-ai-projectmanager'));
}
