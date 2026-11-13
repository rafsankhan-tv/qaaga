import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';
import { getListingByIdFromDatabase } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const listing = await getListingByIdFromDatabase(id);
  if (!listing) {
    return { title: 'Property Details — QAAGA.com' };
  }
  return {
    title: `${listing.title} — ${listing.area}, ${listing.city} · QAAGA`,
    description:
      listing.description ||
      `Book ${listing.title} on qaaga.com. ${listing.bedrooms}, verified amenities and skyline views.`,
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const initialBranding = await readServerBranding();

  return (
    <QaagaWebsite
      initialBranding={initialBranding}
      initialRoute={`/properties/${id}`}
      initialListingId={id}
    />
  );
}
