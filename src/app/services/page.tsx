import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Hospitality & Airport Services in KL — QAAGA Super Marketplace',
  description: 'Book verified airport transfers, private chef dining, and concierge services on qaaga.com.',
};

export default async function ServicesPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/services" />;
}
