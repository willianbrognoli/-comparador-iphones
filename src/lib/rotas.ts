import { paresPopulares, parSlug } from './comparar';
import { POR_SLUG } from '@/data/iphones';

const PARES = new Set(paresPopulares().map(([a, b]) => parSlug(a, b)));

/** URL amigável quando o par tem página própria; senão, o comparador com ?m= */
export function urlComparacao(slugs: string[]) {
  const ps = slugs.map((s) => POR_SLUG.get(s)).filter(Boolean);
  if (ps.length === 2) {
    const par = parSlug(ps[0]!, ps[1]!);
    if (PARES.has(par)) return `/comparar/${par}/`;
  }
  return slugs.length ? `/comparar/?m=${slugs.join(',')}` : '/comparar/';
}
export const temPagina = (par: string) => PARES.has(par);
