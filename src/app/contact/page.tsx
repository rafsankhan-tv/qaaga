import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact & Help Center — QAAGA Super Marketplace',
  description: 'Get 24/7 guest support, safety information, and contact verified Kuala Lumpur hosts.',
};

export default async function ContactPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/contact" />;
}
