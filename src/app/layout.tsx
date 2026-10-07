import type { Metadata, Viewport } from 'next';
import { Instrument_Sans } from 'next/font/google';
import './globals.css';
import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';
import Bandeja from '@/components/Bandeja';
import JsonLd from '@/components/JsonLd';
import { SITE, abs } from '@/lib/site';

const fonte = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument', display: 'swap', axes: ['wdth'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url + '/'),
  title: { default: `Comparador de iPhones: todos os modelos lado a lado | ${SITE.nome}`, template: `%s | ${SITE.nome}` },
  description: SITE.descricao,
  applicationName: SITE.nome,
  alternates: { canonical: abs('/') },
  openGraph: { type: 'website', locale: 'pt_BR', siteName: SITE.nome, url: abs('/'), images: [{ url: abs('/og.png'), width: 1200, height: 630, alt: 'Comparador de iPhones' }] },
  twitter: { card: 'summary_large_image' },
  icons: { icon: `${SITE.basePath}/icon.svg` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
};

export const viewport: Viewport = { themeColor: '#e9ecef', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fonte.variable}>
      <body>
        <JsonLd dados={{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.nome, url: abs('/'), inLanguage: 'pt-BR', description: SITE.descricao }} />
        <a className="sr" href="#conteudo">Pular para o conteúdo</a>
        <Cabecalho />
        <main id="conteudo">{children}</main>
        <Rodape />
        <Bandeja />
      </body>
    </html>
  );
}
