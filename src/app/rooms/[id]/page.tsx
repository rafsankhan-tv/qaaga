import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';
import { INITIAL_LISTINGS } from '@/data/listings';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface RoomDetailsProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoomDetailsProps) {
  const { id } = await params;
  const listing = INITIAL_LISTINGS.find((item) => item.id === id);
  if (!listing) {
    return { title: 'Room Details — QAAGA Super Marketplace' };
  }
  return {
    title: `${listing.title} — ${listing.area}, ${listing.city} · QAAGA`,
    description: listing.description || `Book ${listing.title} on qaaga.com. ${listing.bedrooms}, top amenities and skyline views.`,
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
