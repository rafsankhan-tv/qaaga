import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Instant Booking & Reservations — QAAGA Super Marketplace',
  description: 'Book verified stays, experiences, and hospitality services in Kuala Lumpur on qaaga.com.',
};

export default async function BookingGeneralPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/booking" />;
}
