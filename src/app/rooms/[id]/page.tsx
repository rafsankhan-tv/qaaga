import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';
import { getListingByIdFromDatabase } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

interface RoomDetailsProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoomDetailsProps) {
  const { id } = await params;
  const listing = await getListingByIdFromDatabase(id);
  if (!listing) {
    return { title: 'Room Details — QAAGA Super Marketplace' };
  }
  return {
    title: `${listing.title} — ${listing.area}, ${listing.city} · QAAGA`,
    description:
      listing.description ||
      `Book ${listing.title} on qaaga.com. ${listing.bedrooms}, top amenities and skyline views.`,
  };
}

export default async function RoomDetailsPage({ params }: RoomDetailsProps) {
  const { id } = await params;
  const initialBranding = await readServerBranding();

  return (
    <QaagaWebsite
      initialBranding={initialBranding}
      initialRoute={`/rooms/${id}`}
      initialListingId={id}
    />
  );
}
