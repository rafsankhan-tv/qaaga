import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Bookings & Trips — QAAGA Super Marketplace',
  description: 'Manage your active reservations, check-in instructions, and upcoming trips on qaaga.com.',
};

export default async function MyBookingsPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/my-bookings" />;
}
