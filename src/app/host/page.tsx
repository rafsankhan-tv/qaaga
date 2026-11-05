import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Host Studio — QAAGA Super Marketplace',
  description: 'Publish and manage your stays, experiences, and hospitality services in Kuala Lumpur on qaaga.com.',
};

export default async function HostPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/host" />;
}
