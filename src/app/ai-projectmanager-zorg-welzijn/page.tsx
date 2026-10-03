import { AiPmLanding } from '@/components/landing/AiPmLanding';
import { aiPmMetadata, getAiPmPage } from '@/lib/ai-pm-pages';

export const metadata = aiPmMetadata('ai-projectmanager-zorg-welzijn');

export default function Page() {
  return <AiPmLanding page={getAiPmPage('ai-projectmanager-zorg-welzijn')} />;
}
