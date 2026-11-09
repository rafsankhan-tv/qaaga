import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Wishlist — QAAGA Super Marketplace',
  description: 'View and manage your saved apartments, rooms, and stays in Kuala Lumpur on qaaga.com.',
};

export default async function WishlistPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/wishlist" />;
}
