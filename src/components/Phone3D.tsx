'use client';

import { useEffect, useRef, useState } from 'react';
import type { IPhone } from '@/data/types';
import PhoneSVG from './PhoneSVG';

export interface ItemCena { p: IPhone; cor: string }

interface Props {
  itens: ItemCena[];
  rotulo: string;
  altura?: number | string;
  autoGiro?: boolean;
  mostrarMedidas?: boolean;
  vista?: 'frente' | 'tras';
}

/**
 * Visualizador 3D leve: carrega o three.js só quando aparece na tela,
 * renderiza sob demanda (sem loop parado gastando bateria) e limita o devicePixelRatio.
 * Antes de carregar (e sem WebGL) mostra a silhueta em SVG, que também é o que o Google vê.
 */
export default function Phone3D({ itens, rotulo, altura = 460, autoGiro = true, mostrarMedidas = false, vista = 'frente' }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ atualizar: (i: ItemCena[]) => void; destruir: () => void } | null>(null);
  const [pronto, setPronto] = useState(false);
  const chave = itens.map((i) => i.p.slug + i.cor).join('|');

  useEffect(() => {
    const el = host.current; if (!el) return;
    let cancelado = false;
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || api.current) return;
      io.disconnect();
      try {
        const c = document.createElement('canvas');
        if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
        const { montarCena } = await import('@/lib/cena3d');
        if (cancelado) return;
        api.current = montarCena(el, itens, { autoGiro, vista, aoPronto: () => setPronto(true) });
      } catch { /* fica com o SVG */ }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => { cancelado = true; io.disconnect(); api.current?.destruir(); api.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { api.current?.atualizar(itens); }, [chave]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`palco3d ${pronto ? 'pronto' : ''}`} style={{ height: altura }} role="img" aria-label={rotulo}>
      <div ref={host} className="palco3d-canvas" />
      <div className="palco3d-fallback" aria-hidden={pronto}>
        {itens.map((i) => <PhoneSVG key={i.p.slug} p={i.p} cor={i.cor} escala={itens.length > 1} />)}
      </div>
      {mostrarMedidas && (
        <div className="palco3d-medidas" aria-hidden="true">
          {itens.map((i) => <span key={i.p.slug} style={{ ['--c' as string]: i.cor }}>{i.p.nome.replace(/ \(.+\)/, '')} · {i.p.corpo.altura} × {i.p.corpo.largura} mm</span>)}
        </div>
      )}
      <span className="palco3d-dica" aria-hidden="true">Arraste para girar</span>
    </div>
  );
}
