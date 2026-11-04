import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} />;
}
