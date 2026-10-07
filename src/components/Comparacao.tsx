'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { POR_SLUG } from '@/data/iphones';
import { diferencas, fmtPreco } from '@/lib/comparar';
import { CORES_COLUNA } from '@/lib/site';
import { urlComparacao } from '@/lib/rotas';
import Phone3D from './Phone3D';
import Seletor from './Seletor';
import Tabela from './Tabela';
import Placar from './Placar';

export function Duelo({ slugs }: { slugs: string[] }) {
  const ps = useMemo(() => slugs.map((s) => POR_SLUG.get(s)!).filter(Boolean), [slugs]);
  const [cores, setCores] = useState<Record<string, string>>({});
  const corDe = (slug: string) => cores[slug] ?? POR_SLUG.get(slug)!.cores[0].hex;
  const colunas = ps.map((_, i) => CORES_COLUNA[i]);
  const muda = ps.length === 2 ? diferencas(ps[0], ps[1]) : [];

  if (ps.length === 0) return <p className="mudo">Escolha pelo menos dois iPhones acima para ver a comparação.</p>;

  return (
    <>
      <div className="duelo" style={{ ['--n' as string]: ps.length }}>
        {ps.map((p, i) => (
          <article className="lutador" key={p.slug} style={{ ['--c' as string]: colunas[i] }}>
            <h2><Link href={`/iphone/${p.slug}/`}>{p.nome}</Link></h2>
            <span className="mudo" style={{ fontSize: 14 }}>{p.ano} · {p.chip.nome} · {p.preco.ficticio ? 'preço a confirmar' : fmtPreco(p.preco.lancamentoBR)}</span>
            <div className="cores" role="group" aria-label={`Cor do ${p.nome} no modelo 3D`}>
              {p.cores.map((c) => (
                <button key={c.nome} type="button" className="cor" title={c.nome} aria-label={c.nome} aria-pressed={corDe(p.slug) === c.hex}
                  style={{ ['--c' as string]: c.hex }} onClick={() => setCores((o) => ({ ...o, [p.slug]: c.hex }))} />
              ))}
            </div>
          </article>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <Phone3D itens={ps.map((p) => ({ p, cor: corDe(p.slug) }))} mostrarMedidas altura="min(64vh, 520px)"
          rotulo={`Modelos 3D em escala real: ${ps.map((p) => p.nome).join(', ')}`} />
      </div>

      <div className="duas-col" style={{ marginTop: 40 }}>
        <section aria-labelledby="t-muda">
          <h2 className="h2" id="t-muda" style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)' }}>{ps.length === 2 ? 'O que muda' : 'Em resumo'}</h2>
          {muda.length ? <ul className="mudancas">{muda.map((m) => <li key={m}>{m}</li>)}</ul>
            : <ul className="mudancas">{ps.map((p) => <li key={p.slug}><b>{p.nome}:</b> {p.resumo}</li>)}</ul>}
        </section>
        <section aria-labelledby="t-notas">
          <h2 className="h2" id="t-notas" style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)' }}>Notas por categoria</h2>
          <Placar ps={ps} cores={colunas} />
          <p className="mudo" style={{ fontSize: 13, marginTop: 12 }}>Notas de 0 a 10 calculadas a partir das especificações, comparando com todos os iPhones já lançados.</p>
        </section>
      </div>

      <section style={{ marginTop: 44 }} aria-label="Ficha técnica lado a lado">
        <Tabela ps={ps} cores={colunas} titulo="Ficha técnica completa" />
      </section>
    </>
  );
}

/** Página /comparar/ : escolhe livremente até 3 modelos (lê ?m= da URL). */
export function ComparadorLivre() {
  const sp = useSearchParams();
  const router = useRouter();
  const daUrl = useMemo(() => (sp.get('m') ?? '').split(',').filter((s) => POR_SLUG.has(s)).slice(0, 3), [sp]);
  const [v, setV] = useState<string[]>(daUrl.length ? daUrl : ['iphone-17-pro', 'iphone-18-pro']);
  useEffect(() => { if (daUrl.length) setV(daUrl); }, [daUrl]);

  const mudar = (n: string[]) => {
    setV(n);
    const destino = urlComparacao(n);
    if (destino.startsWith('/comparar/?') || n.length === 0) router.replace(destino, { scroll: false });
  };
  const par = urlComparacao(v);
  return (
    <>
      <Seletor valores={v} aoMudar={mudar} />
      {par.startsWith('/comparar/') && !par.includes('?') && par !== '/comparar/' && (
        <p className="mudo" style={{ fontSize: 14, marginTop: 10 }}>Esta comparação tem página própria: <Link href={par}>abrir link permanente</Link>.</p>
      )}
      <div style={{ marginTop: 26 }}><Duelo slugs={v} /></div>
    </>
  );
}
