import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { ClientProvider } from '@/src/components/providers/client-provider';

const locales = ['en', 'vi'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  // Get messages for client-side components
  const messages = await getMessages();

  return (
    <ClientProvider locale={locale} messages={messages}>
      {children}
    </ClientProvider>
  );
}
