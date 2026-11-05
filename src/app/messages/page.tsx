import { QaagaWebsite } from '@/components/QaagaWebsite';
import { readServerBranding } from '@/lib/brandingStorage.server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Messages & Inbox — QAAGA Super Marketplace',
  description: 'Chat directly with verified hosts in Kuala Lumpur on qaaga.com.',
};

export default async function MessagesPage() {
  const initialBranding = await readServerBranding();
  return <QaagaWebsite initialBranding={initialBranding} initialRoute="/messages" />;
}
