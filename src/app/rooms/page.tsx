import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Rooms & Stays in Dhaka — QAAGA',
  description: 'Explore furnished apartments, private rooms and verified stays across Dhaka on qaaga.com.',
};

export default async function RoomsPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/rooms" />;
}
