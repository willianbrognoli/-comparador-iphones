'use client';
import { useState } from 'react';
import type { IPhone } from '@/data/types';
import Phone3D from './Phone3D';

export default function ModeloHero({ p }: { p: IPhone }) {
  const [cor, setCor] = useState(p.cores[0]);
  return (
    <div>
      <Phone3D itens={[{ p, cor: cor.hex }]} rotulo={`Modelo 3D do ${p.nome} na cor ${cor.nome}`} altura="min(70vh, 560px)" vista="tras" />
      <div className="cores" role="group" aria-label="Cores de lançamento">
        {p.cores.map((c) => (
          <button key={c.nome} type="button" className="cor" style={{ ['--c' as string]: c.hex }} aria-pressed={c.nome === cor.nome} aria-label={c.nome} title={c.nome} onClick={() => setCor(c)} />
        ))}
      </div>
      <div className="nome-cor">{cor.nome}</div>
    </div>
  );
}
