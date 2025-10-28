import './globals.css';
import '@/lib/fonts';

export const metadata = {
  title: 'Touchfind Painel',
  description: 'Painel de gestão Touchfind'
};

export default function RootLayout({children}:{children: React.ReactNode}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}