'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IPHONES } from '@/data/iphones';
import type { IPhone } from '@/data/types';
import { notas, fmtNum } from '@/lib/comparar';
import { bandeja, useBandeja } from '@/lib/bandeja';
import PhoneSVG from './PhoneSVG';

const FILTROS: { id: string; nome: string; f: (p: IPhone) => boolean }[] = [
  { id: 'todos', nome: 'Todos', f: () => true },
  { id: 'atuais', nome: 'Recebem iOS', f: (p) => p.ios.suportado },
  { id: 'pro', nome: 'Pro e Pro Max', f: (p) => ['pro', 'promax'].includes(p.linha) },
  { id: 'base', nome: 'Linha principal', f: (p) => ['original', 'base', 'plus', 'xr', 'air'].includes(p.linha) },
  { id: 'compactos', nome: 'Compactos', f: (p) => p.corpo.altura < 140 },
  { id: 'baratos', nome: 'SE e "e"', f: (p) => ['se', 'e'].includes(p.linha) },
  { id: 'novos', nome: 'Especiais', f: (p) => ['air', 'dobravel'].includes(p.linha) },
];

export default function Grade() {
  const [filtro, setFiltro] = useState('todos');
  const escolhidos = useBandeja();
  const anos = useMemo(() => {
    const f = FILTROS.find((x) => x.id === filtro)!.f;
    const m = new Map<number, IPhone[]>();
    [...IPHONES].reverse().filter(f).forEach((p) => m.set(p.ano, [...(m.get(p.ano) ?? []), p]));
    return [...m.entries()];
  }, [filtro]);

  return (
    <>
      <div className="filtros" role="group" aria-label="Filtrar modelos" style={{ marginBottom: 26 }}>
        {FILTROS.map((f) => <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>{f.nome}</button>)}
      </div>
      <div className="anos">
        {anos.map(([ano, ps]) => (
          <section className="ano-bloco" key={ano} aria-labelledby={`ano-${ano}`}>
            <h3 id={`ano-${ano}`}>{ano}</h3>
            <div className="cards">
              {ps.map((p) => {
                const on = escolhidos.includes(p.slug);
                return (
                  <article className="card" key={p.slug}>
                    <div className="vis"><PhoneSVG p={p} escala /></div>
                    <div>
                      <span className="nota num" title="Nota geral (0 a 10)">{fmtNum(notas(p).geral, 1)}</span>
                      <Link prefetch={false} className="nome" href={`/iphone/${p.slug}/`}>{p.nome}</Link>
                      <div className="meta">{p.chip.nome.replace('Apple ', '')} · {fmtNum(p.tela.polegadas, 1)}"</div>
                    </div>
                    <button type="button" className="add" aria-pressed={on} aria-label={on ? `Tirar ${p.nome} da comparação` : `Adicionar ${p.nome} à comparação`} onClick={() => bandeja.alternar(p.slug)}>{on ? '✓' : '+'}</button>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
