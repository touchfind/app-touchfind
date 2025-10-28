'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'button' | 'link';
}

export default function LanguageToggle({ className = '', variant = 'button' }: LanguageToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLocale = locale === 'pt' ? 'en' : 'pt';
    
    startTransition(() => {
      // Remove o locale atual do pathname e adiciona o novo
      const pathWithoutLocale = pathname.replace(`/${locale}`, '');
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      router.replace(newPath);
    });
  };

  if (variant === 'link') {
    return (
      <button
        onClick={toggleLanguage}
        disabled={isPending}
        className={`text-sm text-gray-600 hover:text-gray-900 underline disabled:opacity-50 ${className}`}
      >
        {locale === 'pt' ? 'English' : 'Português'}
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${className}`}
    >
      <span className="text-lg">
        {locale === 'pt' ? '🇬🇧' : '🇵🇹'}
      </span>
      <span>
        {locale === 'pt' ? 'EN' : 'PT'}
      </span>
    </button>
  );
}