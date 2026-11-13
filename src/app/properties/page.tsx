import dynamicLoader from 'next/dynamic';
import { readServerBranding } from '@/lib/brandingStorage.server';
import { SearchGridSkeleton } from '@/components/Skeletons';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Furnished Apartments & Rooms — QAAGA.com',
  description:
    'Browse verified furnished apartments, sky condos, and private rooms across Kuala Lumpur on QAAGA.com.',
};

const PropertiesCatalogClient = dynamicLoader(
  () => import('@/components/PropertiesCatalogClient'),
  {
    loading: () => (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <SearchGridSkeleton count={12} />
      </div>
    ),
  }
);

export default async function PropertiesPage() {
  const initialBranding = await readServerBranding();
  return <PropertiesCatalogClient branding={initialBranding} />;
}
