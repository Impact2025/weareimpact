import type { Metadata } from 'next';
import { IntakeChat } from '@/components/features/IntakeChat';

export const metadata: Metadata = {
  title: 'Intake met Iris | WeAreImpact',
  description: 'Beantwoord een paar vragen zodat we een onderbouwd voorstel voor AgentOS & Iris kunnen maken.',
  robots: { index: false, follow: false },
};

export default function IntakePage() {
  return <IntakeChat />;
}
