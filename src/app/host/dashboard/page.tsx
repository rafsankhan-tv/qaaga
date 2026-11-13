import dynamicLoader from 'next/dynamic';
import { readServerBranding } from '@/lib/brandingStorage.server';
import { DashboardSkeleton } from '@/components/Skeletons';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Host Studio Dashboard — QAAGA.com',
  description:
    'Publish and manage your furnished rooms and apartments, approve bookings, and verify payment slips on QAAGA.com.',
};

const HostDashboard = dynamicLoader(
  () => import('@/components/dashboards/HostDashboard'),
  { loading: () => <DashboardSkeleton /> }
);

export default async function HostDashboardPage() {
  const initialBranding = await readServerBranding();
  return <HostDashboard branding={initialBranding} />;
}
