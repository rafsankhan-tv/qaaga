import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

interface BookingParamsProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookingParamsProps) {
  const { id } = await params;
  return {
    title: `Reservation Checkout (${id}) — QAAGA Super Marketplace`,
    description: `Complete your secure booking on qaaga.com. Protected by QaagaCover.`,
  };
}

export default async function BookingWithIdPage({ params }: BookingParamsProps) {
  const { id } = await params;
  const initialBranding = await readServerBranding();

  return (
    <QaagaWebsite
      initialBranding={initialBranding}
      initialRoute={`/booking/${id}`}
      initialListingId={id}
    />
  );
}
