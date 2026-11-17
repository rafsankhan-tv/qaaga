import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Experiences in Dhaka — QAAGA Super Marketplace',
  description: 'Book local food tours, rooftop experiences, and photography walks in Dhaka on qaaga.com.',
};

export default async function ExperiencesPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/experiences" />;
}
