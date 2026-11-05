import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Log In — QAAGA Super Marketplace',
  description: 'Log in to your qaaga.com account using email OTP or social providers.',
};

export default async function LoginPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/login" />;
}
