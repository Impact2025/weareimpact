import { renderAiPmOg } from '@/lib/ai-pm-og';

export const runtime = 'edge';
export const alt = 'WeAreImpact: ai-projectmanagement-begrippen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderAiPmOg({"eyebrow":"Begrippenlijst","title":"AI-projectmanagement begrippen in gewone taal"});
}
