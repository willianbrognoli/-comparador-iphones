'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { IPHONES, POR_SLUG } from '@/data/iphones';
import { CORES_COLUNA } from '@/lib/site';
import PhoneSVG from './PhoneSVG';

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function Slot({ indice, valor, ocupados, aoEscolher, aoLimpar }: {
  indice: number; valor?: string; ocupados: string[]; aoEscolher: (s: string) => void; aoLimpar: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState('');
  const [ativo, setAtivo] = useState(0);
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const p = valor ? POR_SLUG.get(valor) : undefined;

  const opcoes = useMemo(() => {
    const t = norm(q.trim());
    return [...IPHONES].reverse().filter((x) => !t || norm(`${x.nome} ${x.ano} ${x.chip.nome}`).includes(t));
  }, [q]);

  useEffect(() => {
    if (!aberto) return;
    campo.current?.focus();
    const fora = (e: PointerEvent) => { if (!raiz.current?.contains(e.target as Node)) setAberto(false); };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [aberto]);

  const escolher = (s: string) => { aoEscolher(s); setAberto(false); setQ(''); };
  const tecla = (e: React.KeyboardEvent) => {
    const livres = opcoes.filter((o) => !ocupados.includes(o.slug) || o.slug === valor);
    if (e.key === 'ArrowDown') { e.preventDefault(); setAtivo((a) => Math.min(livres.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (livres[ativo]) escolher(livres[ativo].slug); }
    else if (e.key === 'Escape') setAberto(false);
  };

  let anoAnterior = 0;
  let k = -1;
  return (
    <div className="slot" ref={raiz} style={{ ['--c' as string]: CORES_COLUNA[indice] }}>
      <button type="button" className={`slot-btn ${p ? 'cheio' : ''}`} aria-haspopup="listbox" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
        {p ? <PhoneSVG p={p} className="mini" /> : <span className="mais" aria-hidden="true">+</span>}
        <span>
          <b>{p ? p.nome : `iPhone ${indice + 1}`}</b>
          <small>{p ? `${p.ano} · ${p.chip.nome}` : 'Escolher modelo'}</small>
        </span>
      </button>
      {p && <button type="button" className="slot-x" aria-label={`Tirar ${p.nome}`} onClick={aoLimpar}>×</button>}
      {aberto && (
        <div className="lista">
          <input ref={campo} value={q} onChange={(e) => { setQ(e.target.value); setAtivo(0); }} onKeyDown={tecla}
            placeholder="Buscar: 15 Pro, 2019, A17…" role="combobox" aria-expanded="true" aria-controls={id} aria-autocomplete="list" aria-label="Buscar iPhone" />
          <ul id={id} role="listbox">
            {opcoes.length === 0 && <li className="ano">Nenhum iPhone com esse nome.</li>}
            {opcoes.map((o) => {
              const usado = ocupados.includes(o.slug) && o.slug !== valor;
              if (!usado) k++;
              const cab = o.ano !== anoAnterior ? <li className="ano" role="presentation" key={'a' + o.ano}>{o.ano}</li> : null;
              anoAnterior = o.ano;
              return [cab, (
                <li key={o.slug} role="option" aria-selected={!usado && k === ativo} aria-disabled={usado}
                  onMouseEnter={() => !usado && setAtivo(k)} onClick={() => !usado && escolher(o.slug)}>
                  <span>{o.nome}</span><small>{o.chip.nome.replace('Apple ', '')}</small>
                </li>
              )];
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Seletor({ valores, aoMudar, botao }: { valores: string[]; aoMudar: (v: string[]) => void; botao?: React.ReactNode }) {
  const slots = [0, 1, 2];
  return (
    <div className="seletor" style={{ ['--n' as string]: 3 }}>
      {slots.map((i) => (
        <Slot key={i} indice={i} valor={valores[i]} ocupados={valores}
          aoEscolher={(s) => { const v = [...valores]; v[i] = s; aoMudar(v.filter(Boolean)); }}
          aoLimpar={() => aoMudar(valores.filter((_, j) => j !== i))} />
      ))}
      {botao}
    </div>
  );
}
