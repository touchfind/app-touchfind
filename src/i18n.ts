import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Lista de idiomas suportados
const locales = ['pt', 'en'];

export default getRequestConfig(async ({locale}) => {
  // Validar se o idioma é suportado
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});