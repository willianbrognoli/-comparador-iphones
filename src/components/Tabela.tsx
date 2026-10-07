'use client';
import { useState } from 'react';
import type { IPhone } from '@/data/types';
import { GRUPOS, vencedores } from '@/lib/comparar';

export default function Tabela({ ps, cores, titulo }: { ps: IPhone[]; cores: string[]; titulo: string }) {
  const [soDif, setSoDif] = useState(false);
  const notas = new Set<string>();
  return (
    <>
      {ps.length > 1 && (
        <label className="so-dif" style={{ marginBottom: 14 }}>
          <input type="checkbox" checked={soDif} onChange={(e) => setSoDif(e.target.checked)} /> Mostrar só o que é diferente
        </label>
      )}
      <div className="tabela-w">
        <table className="spec">
          <caption>{titulo}</caption>
          {ps.length > 1 && (
            <thead>
              <tr><th scope="col" className="vazio"><span className="sr">Especificação</span></th>{ps.map((p, i) => <th key={p.slug} scope="col" style={{ ['--c' as string]: cores[i] }}><span>{p.nome}</span></th>)}</tr>
            </thead>
          )}
          {GRUPOS.map((g) => {
            const linhas = g.linhas.filter((l) => !soDif || new Set(ps.map((p) => l.valor(p))).size > 1);
            if (!linhas.length) return null;
            return (
              <tbody key={g.id}>
                <tr className="grupo"><th scope="rowgroup" colSpan={ps.length + 1}>{g.titulo}</th></tr>
                {linhas.map((l) => {
                  const v = vencedores(l, ps);
                  if (l.nota) notas.add(l.nota);
                  return (
                    <tr key={l.id}>
                      <th scope="row">{l.rotulo}</th>
                      {ps.map((p, i) => <td key={p.slug} className={v.has(i) ? 'melhor' : undefined} style={{ ['--c' as string]: cores[i] }}>{l.valor(p)}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>
        <p className="nota-rodape">{[...notas].join(' ')}{ps.length > 1 ? ' O ponto colorido marca o melhor valor da linha.' : ''}</p>
      </div>
    </>
  );
}
