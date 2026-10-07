import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IPHONES, getIPhone } from '@/data/iphones';
import { antecessor, sucessor, notas, fmtNum, fmtGB, fmtPreco, fmtData, pol, parSlug } from '@/lib/comparar';
import { temPagina } from '@/lib/rotas';
import { abs } from '@/lib/site';
import ModeloHero from '@/components/ModeloHero';
import Tabela from '@/components/Tabela';
import JsonLd from '@/components/JsonLd';

export const dynamicParams = false;
export function generateStaticParams() { return IPHONES.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getIPhone((await params).slug);
  if (!p) return {};
  const t = `${p.nome}: ficha técnica completa, preço e 3D`;
  const d = `${p.nome} (${p.ano}): tela de ${pol(p.tela.polegadas)} ${p.tela.tipo}, ${p.chip.nome}, câmera de ${p.cameras.traseiras[0].mp} MP, ${p.bateria.videoHoras ? `até ${p.bateria.videoHoras} h de vídeo` : `bateria de ${p.bateria.mah} mAh`}. ${p.resumo}`;
  return { title: t, description: d.slice(0, 160), alternates: { canonical: abs(`/iphone/${p.slug}/`) }, openGraph: { title: t, description: d, url: abs(`/iphone/${p.slug}/`) } };
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const p = getIPhone((await params).slug);
  if (!p) notFound();
  const n = notas(p);
  const ant = antecessor(p), suc = sucessor(p);
  const irmaos = IPHONES.filter((x) => x.ano === p.ano && x.slug !== p.slug);
  const sugestoes = [ant, suc, ...irmaos].filter((x, i, a): x is NonNullable<typeof x> => !!x && a.indexOf(x) === i).slice(0, 6);
  const tiles = [
    { r: 'Tela', v: `${pol(p.tela.polegadas)} ${p.tela.tipo}`, s: `${p.tela.hz} Hz · ${p.tela.ppi} ppi` },
    { r: 'Chip', v: p.chip.nome.replace('Apple ', ''), s: p.chip.ram ? `${fmtGB(p.chip.ram)} de RAM` : 'RAM não divulgada' },
    { r: 'Câmeras', v: p.cameras.traseiras.map((l) => `${l.mp}`).join(' + ') + ' MP', s: p.cameras.zoomOtico ? `zoom óptico ${fmtNum(p.cameras.zoomOtico, p.cameras.zoomOtico % 1 ? 1 : 0)}x` : p.cameras.video.split(' · ')[0] },
    { r: 'Bateria', v: p.bateria.videoHoras ? `até ${p.bateria.videoHoras} h` : p.bateria.mah ? `${fmtNum(p.bateria.mah)} mAh` : '—', s: p.bateria.videoHoras ? 'de vídeo' : 'capacidade' },
  ];

  return (
    <div className="wrap">
      <nav className="migalhas" aria-label="Você está em"><Link href="/">Início</Link><span>/</span><Link href="/#todos">iPhones</Link><span>/</span><span aria-current="page">{p.nome}</span></nav>

      <section className="modelo-hero">
        <div>
          <span className={`selo ${p.ios.suportado ? '' : 'off'}`}><i />{p.ios.suportado ? `Recebe o ${p.ios.maximo}` : `Sem atualizações desde o ${p.ios.maximo}`}</span>
          <h1>{p.nome}</h1>
          <p className="lead" style={{ margin: '0 0 6px' }}>{p.resumo}</p>
          <p className="mudo" style={{ margin: 0 }}>Anunciado em {fmtData(p.anuncio)}</p>

          <div className="preco" style={{ ['--c' as string]: p.cores[0].hex }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <small>Preço de lançamento no Brasil</small>
              <strong className="num">{fmtPreco(p.preco.lancamentoBR)}</strong>
            </div>
            {p.preco.ficticio && <span className="ilustrativo">valor ilustrativo</span>}
          </div>

          <div className="blocos">{tiles.map((t) => <div className="bloco" key={t.r}><small>{t.r}</small><b>{t.v}</b><span>{t.s}</span></div>)}</div>

          <div className="nota-geral" style={{ marginTop: 22 }}>
            <div className="anel" style={{ ['--p' as string]: n.geral / 10 }}><b className="num">{fmtNum(n.geral, 1)}</b></div>
            <div className="notas" style={{ flex: 1 }}>
              {([['Desempenho', n.desempenho], ['Câmeras', n.camera], ['Tela', n.tela], ['Bateria', n.bateria]] as const).map(([r, v]) => (
                <div className="nota-linha" key={r}><span>{r}</span><div className="barra"><i style={{ width: `${v * 10}%` }} /></div><b className="num">{fmtNum(v, 1)}</b></div>
              ))}
            </div>
          </div>
        </div>
        <ModeloHero p={p} />
      </section>

      <section className="secao" style={{ paddingTop: 20 }} aria-labelledby="t-comp">
        <h2 className="h2" id="t-comp">Comparar o {p.nome} com</h2>
        <div className="faixa-chips">
          {sugestoes.map((x) => {
            const par = parSlug(p, x);
            return <Link prefetch={false} key={x.slug} className="chip" href={temPagina(par) ? `/comparar/${par}/` : `/comparar/?m=${p.slug},${x.slug}`}><b>{x === ant ? 'Antecessor' : x === suc ? 'Sucessor' : 'Mesmo ano'}</b>{x.nome}</Link>;
          })}
          <Link className="chip" href={`/comparar/?m=${p.slug}`}>Outro modelo…</Link>
        </div>
      </section>

      <section style={{ paddingBottom: 60 }} aria-label="Ficha técnica">
        <Tabela ps={[p]} cores={['#15181d']} titulo={`Ficha técnica do ${p.nome}`} />
      </section>

      <JsonLd dados={{
        '@context': 'https://schema.org', '@type': 'Product', name: p.nome, brand: { '@type': 'Brand', name: 'Apple' }, category: 'Smartphone',
        description: p.resumo, releaseDate: p.anuncio, color: p.cores.map((c) => c.nome).join(', '),
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Tela', value: `${p.tela.polegadas} polegadas ${p.tela.tipo}` },
          { '@type': 'PropertyValue', name: 'Chip', value: p.chip.nome },
          { '@type': 'PropertyValue', name: 'Armazenamento', value: p.armazenamento.map(fmtGB).join(', ') },
          { '@type': 'PropertyValue', name: 'Peso', value: `${p.corpo.peso} g` },
        ],
        ...(p.preco.ficticio ? {} : { offers: { '@type': 'Offer', priceCurrency: 'BRL', price: p.preco.lancamentoBR, availability: 'https://schema.org/InStock' } }),
      }} />
      <JsonLd dados={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: abs('/') },
        { '@type': 'ListItem', position: 2, name: p.nome, item: abs(`/iphone/${p.slug}/`) },
      ] }} />
    </div>
  );
}
