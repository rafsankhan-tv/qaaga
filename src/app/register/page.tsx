import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign Up & Register — QAAGA Super Marketplace',
  description: 'Create an account on qaaga.com using verified email OTP authentication.',
};

export default async function RegisterPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/register" />;
}
