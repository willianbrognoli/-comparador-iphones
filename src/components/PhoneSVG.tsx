import type { IPhone } from '@/data/types';
import { ehClara } from '@/lib/site';

/** Silhueta frontal em escala real (1 unidade = 1 mm). Leve, sem JS. */
export default function PhoneSVG({ p, cor, escala = false, className }: { p: IPhone; cor?: string; escala?: boolean; className?: string }) {
  const { largura: w, altura: h, raio: r } = p.corpo;
  const c = cor ?? p.cores[0].hex;
  const home = p.tela.frente === 'botao-home';
  const bl = home ? w * 0.07 : w * 0.035, bt = home ? h * 0.14 : w * 0.035;
  const sw = w - bl * 2, sh = h - bt * 2;
  const H = 170; // altura de referência do quadro (o maior iPhone tem ~164 mm)
  const vb = escala ? `${-(80 - w) / 2} ${-(H - h)} 80 ${H}` : `-2 -2 ${w + 4} ${h + 4}`;
  return (
    <svg className={className ?? 'phone-svg'} viewBox={vb} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <rect x="0" y="0" width={w} height={h} rx={r} fill={c} />
      <rect x="0.9" y="0.9" width={w - 1.8} height={h - 1.8} rx={Math.max(1, r - 0.9)} fill={home && ehClara(c) ? '#f3f3f1' : '#0a0b0e'} />
      <defs>
        <linearGradient id={`g-${p.slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a2030" /><stop offset="1" stopColor="#0c0f16" />
        </linearGradient>
      </defs>
      <rect x={bl} y={bt} width={sw} height={sh} rx={home ? 1 : Math.max(1, r - bl)} fill={`url(#g-${p.slug})`} />
      <circle cx={w * 0.32} cy={h * 0.7} r={w * 0.45} fill={c} opacity="0.28" />
      {p.tela.frente === 'notch' && <rect x={(w - sw * 0.45) / 2} y={bt - 2} width={sw * 0.45} height={5.5} rx={2.6} fill="#0a0b0e" />}
      {p.tela.frente === 'ilha' && <rect x={(w - sw * 0.3) / 2} y={bt + 2} width={sw * 0.3} height={3.6} rx={1.8} fill="#000" />}
      {p.tela.frente === 'furo' && <circle cx={w / 2} cy={bt + 3} r={1.4} fill="#000" />}
      {home && <circle cx={w / 2} cy={h - bt / 2} r={w * 0.08} fill="none" stroke="#8b919a" strokeWidth="0.8" />}
      {home && <rect x={w / 2 - 5} y={bt / 2 - 0.6} width="10" height="1.2" rx="0.6" fill="#555b63" />}
    </svg>
  );
}
