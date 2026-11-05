import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Profile & Account — QAAGA Super Marketplace',
  description: 'Manage your verified qaaga.com profile, guest settings, and role permissions.',
};

export default async function ProfilePage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/profile" />;
}
