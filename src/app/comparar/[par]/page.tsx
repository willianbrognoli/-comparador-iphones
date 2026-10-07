import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { paresPopulares, parSlug, parDeSlug, notas, fmtNum } from '@/lib/comparar';
import { perguntas, veredito } from '@/lib/textos';
import { abs } from '@/lib/site';
import { Duelo } from '@/components/Comparacao';
import JsonLd from '@/components/JsonLd';

export const dynamicParams = false;
export function generateStaticParams() { return paresPopulares().map(([a, b]) => ({ par: parSlug(a, b) })); }

export async function generateMetadata({ params }: { params: Promise<{ par: string }> }): Promise<Metadata> {
  const par = parDeSlug((await params).par);
  if (!par) return {};
  const [a, b] = par;
  const t = `${a.nome} vs ${b.nome}: qual é melhor?`;
  const d = `Compare ${a.nome} e ${b.nome} lado a lado: diferenças de tela, chip, câmeras, bateria, tamanho em 3D e suporte ao iOS.`;
  const url = abs(`/comparar/${parSlug(a, b)}/`);
  return { title: t, description: d, alternates: { canonical: url }, openGraph: { title: t, description: d, url } };
}

export default async function Par({ params }: { params: Promise<{ par: string }> }) {
  const par = parDeSlug((await params).par);
  if (!par) notFound();
  const [a, b] = par;
  const faq = perguntas(a, b);
  const relacionados = paresPopulares().filter(([x, y]) => (x === a || y === a || x === b || y === b) && !(x === a && y === b)).slice(0, 10);
  const na = notas(a), nb = notas(b);
  return (
    <div className="wrap" style={{ paddingBottom: 60 }}>
      <nav className="migalhas" aria-label="Você está em"><Link href="/">Início</Link><span>/</span><Link href="/comparar/">Comparar</Link><span>/</span><span aria-current="page">{a.nome} vs {b.nome}</span></nav>
      <section className="comp-hero">
        <h1>{a.nome} <span className="v">vs</span> {b.nome}</h1>
        <p className="lead" style={{ margin: 0 }}>{veredito(a, b)} Nota geral: {a.nome} {fmtNum(na.geral, 1)} · {b.nome} {fmtNum(nb.geral, 1)}.</p>
      </section>

      <Duelo slugs={[a.slug, b.slug]} />

      <section className="secao faq" aria-labelledby="t-faq" style={{ paddingBottom: 20 }}>
        <h2 className="h2" id="t-faq">Perguntas frequentes</h2>
        {faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.r}</p></details>)}
      </section>

      {relacionados.length > 0 && (
        <section aria-labelledby="t-rel">
          <h2 className="h2" id="t-rel" style={{ fontSize: 'clamp(1.3rem,2.2vw,1.7rem)' }}>Outras comparações</h2>
          <div className="faixa-chips">{relacionados.map(([x, y]) => <Link prefetch={false} key={parSlug(x, y)} className="chip" href={`/comparar/${parSlug(x, y)}/`}>{x.nome} <span className="mudo">vs</span> {y.nome}</Link>)}</div>
        </section>
      )}

      <JsonLd dados={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.r } })) }} />
      <JsonLd dados={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: abs('/') },
        { '@type': 'ListItem', position: 2, name: 'Comparar', item: abs('/comparar/') },
        { '@type': 'ListItem', position: 3, name: `${a.nome} vs ${b.nome}`, item: abs(`/comparar/${parSlug(a, b)}/`) },
      ] }} />
    </div>
  );
}
