import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Stays & Apartments in Kuala Lumpur — QAAGA Super Marketplace',
  description: 'Explore furnished rooms, penthouses, and residences across Kuala Lumpur on qaaga.com.',
};

export default async function StayPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/stay" />;
}
