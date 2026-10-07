import type { IPhone } from '@/data/types';
import { notas, fmtNum, pol } from './comparar';

export function perguntas(a: IPhone, b: IPhone) {
  const na = notas(a), nb = notas(b);
  const [m, o] = na.geral >= nb.geral ? [a, b] : [b, a];
  const rap = a.chip.indice === b.chip.indice ? null : a.chip.indice > b.chip.indice ? a : b;
  const bat = (x: IPhone) => x.bateria.videoHoras ?? 0;
  const tela = a.tela.polegadas === b.tela.polegadas ? null : a.tela.polegadas > b.tela.polegadas ? a : b;
  const leve = a.corpo.peso === b.corpo.peso ? null : a.corpo.peso < b.corpo.peso ? a : b;
  const out = [
    { q: `Qual é melhor, ${a.nome} ou ${b.nome}?`, r: `No conjunto, o ${m.nome} leva vantagem (nota ${fmtNum(Math.max(na.geral, nb.geral), 1)} contra ${fmtNum(Math.min(na.geral, nb.geral), 1)}). O ${o.nome} pode valer a pena se o preço for bem menor ou se você prefere ${o.corpo.altura < m.corpo.altura ? 'um aparelho menor' : 'o tamanho dele'}.` },
    { q: `Qual é mais rápido?`, r: rap ? `O ${rap.nome}, com o ${rap.chip.nome}. O outro usa o ${(rap === a ? b : a).chip.nome}.` : `Os dois usam o mesmo chip (${a.chip.nome}) e têm desempenho parecido.` },
    { q: `Qual tem mais bateria?`, r: bat(a) && bat(b) ? `Pela medição de reprodução de vídeo da Apple, o ${bat(a) >= bat(b) ? a.nome : b.nome} dura mais: até ${Math.max(bat(a), bat(b))} h, contra ${Math.min(bat(a), bat(b))} h.` : `A Apple não publicou o mesmo teste de autonomia para os dois. Pela capacidade, ${(a.bateria.mah ?? 0) >= (b.bateria.mah ?? 0) ? a.nome : b.nome} tem a bateria maior.` },
    { q: `Qual tem a tela maior?`, r: tela ? `O ${tela.nome}, com ${pol(tela.tela.polegadas)}. O outro tem ${pol((tela === a ? b : a).tela.polegadas)}.` : `As duas telas têm ${pol(a.tela.polegadas)}.` },
    { q: `Os dois ainda recebem atualizações do iOS?`, r: [a, b].map((x) => x.ios.suportado ? `O ${x.nome} recebe o ${x.ios.maximo}.` : `O ${x.nome} parou no ${x.ios.maximo}.`).join(' ') },
  ];
  if (leve) out.push({ q: 'Qual é mais leve?', r: `O ${leve.nome}, com ${leve.corpo.peso} g, contra ${(leve === a ? b : a).corpo.peso} g.` });
  return out;
}

export function veredito(a: IPhone, b: IPhone) {
  const na = notas(a), nb = notas(b);
  const cat = (k: 'desempenho' | 'camera' | 'tela' | 'bateria') => (na[k] > nb[k] + 0.2 ? a : nb[k] > na[k] + 0.2 ? b : null);
  const nomes = { desempenho: 'desempenho', camera: 'câmeras', tela: 'tela', bateria: 'bateria' } as const;
  const vA: string[] = [], vB: string[] = [];
  (Object.keys(nomes) as (keyof typeof nomes)[]).forEach((k) => { const w = cat(k); if (w === a) vA.push(nomes[k]); if (w === b) vB.push(nomes[k]); });
  const lista = (l: string[]) => l.length > 1 ? l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1] : l[0];
  const partes: string[] = [];
  if (vA.length) partes.push(`O ${a.nome} vence em ${lista(vA)}.`);
  if (vB.length) partes.push(`O ${b.nome} vence em ${lista(vB)}.`);
  if (!vA.length && !vB.length) partes.push('Os dois ficam muito próximos em todas as categorias; a decisão fica entre tamanho, cor e preço.');
  return partes.join(' ');
}
