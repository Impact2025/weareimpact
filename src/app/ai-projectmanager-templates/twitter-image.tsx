import { renderAiPmOg } from '@/lib/ai-pm-og';

export const runtime = 'edge';
export const alt = 'WeAreImpact: ai-projectmanager-templates';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderAiPmOg({"eyebrow":"Gratis templates","title":"Checklist, projectplan en risicomatrix voor AI-projecten"});
}
