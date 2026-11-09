import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Experiences in Kuala Lumpur — QAAGA Super Marketplace',
  description: 'Book authentic culinary tours, rooftop experiences, and photography walks in KL on qaaga.com.',
};

export default async function ExperiencesPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/experiences" />;
}
