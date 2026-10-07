import type { IPhone } from '@/data/types';
import { notas, fmtNum } from '@/lib/comparar';

const CATS = [['geral', 'Nota geral'], ['desempenho', 'Desempenho'], ['camera', 'Câmeras'], ['tela', 'Tela'], ['bateria', 'Bateria']] as const;

export default function Placar({ ps, cores }: { ps: IPhone[]; cores: string[] }) {
  const ns = ps.map(notas);
  return (
    <div className="placar">
      {CATS.map(([k, nome]) => (
        <div className="placar-linha" key={k}>
          <span>{nome}</span>
          <div className="placar-barras">
            {ps.map((p, i) => (
              <div key={p.slug} style={{ ['--c' as string]: cores[i] }} title={p.nome}>
                <div className="barra"><i style={{ width: `${ns[i][k] * 10}%` }} /></div>
                <b className="num">{fmtNum(ns[i][k], 1)}</b>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
