import Link from 'next/link';
import { IPHONES, POR_SLUG, MAIS_RECENTE } from '@/data/iphones';
import { paresPopulares, parSlug, antecessor } from '@/lib/comparar';
import Phone3D from '@/components/Phone3D';
import HeroInicio from '@/components/HeroInicio';
import Grade from '@/components/Grade';
import JsonLd from '@/components/JsonLd';
import { abs } from '@/lib/site';

export default function Inicio() {
  const era = ['iphone', 'iphone-x', MAIS_RECENTE.linha === 'dobravel' ? 'iphone-18-pro' : MAIS_RECENTE.slug].map((s) => POR_SLUG.get(s)!);
  const cores = ['#B8BCC2', '#F1F1EF', era[2].cores[0].hex];
  const anoMin = MAIS_RECENTE.ano - 2;
  const populares = paresPopulares()
    .filter(([a, b]) => a.ano >= anoMin && b.ano >= anoMin && (a.ano === b.ano || antecessor(b) === a || b.ano - a.ano === 1 && a.linha === b.linha))
    .sort(([a1, b1], [a2, b2]) => b2.geracao - b1.geracao || a2.geracao - a1.geracao)
    .slice(0, 20);
  return (
    <>
      <section className="hero">
        <div className="wrap grid">
          <div>
            <p className="contagem surge"><b>{IPHONES.length} iPhones</b>, de {IPHONES[0].ano} a {MAIS_RECENTE.ano}, com ficha técnica completa.</p>
            <h1 className="h1 surge surge-2">Todos os iPhones, <span className="vs">lado a lado.</span></h1>
            <p className="lead surge surge-3">Escolha até três modelos e compare tela, chip, câmeras, bateria e suporte ao iOS. Gire os aparelhos em 3D, em tamanho real, para ver a diferença de verdade.</p>
            <div className="surge surge-4"><HeroInicio inicial={['iphone-17-pro', 'iphone-18-pro']} /></div>
          </div>
          <Phone3D itens={era.map((p, i) => ({ p, cor: cores[i] }))} altura="min(66vh, 560px)" mostrarMedidas
            rotulo={`Três gerações em escala real: ${era.map((p) => p.nome).join(', ')}`} />
        </div>
      </section>

      <section className="secao" id="populares" aria-labelledby="t-pop" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <div className="cab"><h2 className="h2" id="t-pop">Comparações populares</h2><Link className="chip" href="/comparar/"><b>Montar a minha</b></Link></div>
          <div className="faixa-chips">
            {populares.map(([a, b]) => <Link prefetch={false} key={parSlug(a, b)} className="chip" href={`/comparar/${parSlug(a, b)}/`}>{a.nome} <span className="mudo">vs</span> {b.nome}</Link>)}
          </div>
        </div>
      </section>

      <section className="secao" id="todos" aria-labelledby="t-todos">
        <div className="wrap">
          <div className="cab">
            <div>
              <h2 className="h2" id="t-todos">Todos os iPhones já lançados</h2>
              <p className="mudo">As silhuetas estão na mesma escala: dá para ver o iPhone crescer ano a ano. Toque em + para juntar modelos e comparar.</p>
            </div>
          </div>
          <Grade />
        </div>
      </section>

      <JsonLd dados={{
        '@context': 'https://schema.org', '@type': 'ItemList', name: 'Todos os iPhones',
        itemListElement: [...IPHONES].reverse().map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/iphone/${p.slug}/`), name: p.nome })),
      }} />
    </>
  );
}
