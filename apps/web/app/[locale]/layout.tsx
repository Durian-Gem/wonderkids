import { notFound } from 'next/navigation';

const locales = ['en', 'vi'];

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  return children;
}
