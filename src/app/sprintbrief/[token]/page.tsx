import { SprintbriefChat } from '@/components/features/SprintbriefChat';

export default async function SprintbriefPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SprintbriefChat token={token} />;
}
