import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Rooms & Stays — QAAGA Super Marketplace',
  description: 'Explore verified apartments, sky condos, and private rooms in Kuala Lumpur on qaaga.com.',
};

export default async function RoomsPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/rooms" />;
}
