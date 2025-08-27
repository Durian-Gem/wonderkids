import { notFound } from 'next/navigation';

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

  return children;
}
