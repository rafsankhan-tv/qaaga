import dynamicLoader from 'next/dynamic';
import { readServerBranding } from '@/lib/brandingStorage.server';
import { DashboardSkeleton } from '@/components/Skeletons';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Customer Dashboard — QAAGA.com',
  description:
    'Manage your furnished apartment bookings, identity verification, direct payment proofs, and profile on QAAGA.com.',
};

const UserDashboard = dynamicLoader(
  () => import('@/components/dashboards/UserDashboard'),
  { loading: () => <DashboardSkeleton /> }
);

export default async function UserDashboardPage() {
  const initialBranding = await readServerBranding();
  return <UserDashboard branding={initialBranding} />;
}
