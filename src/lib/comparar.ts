import { IPHONES, POR_SLUG } from '@/data/iphones';
import type { IPhone } from '@/data/types';

export const fmtNum = (n: number, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtGB = (gb: number) => (gb >= 1024 ? `${fmtNum(gb / 1024)} TB` : gb < 1 ? `${fmtNum(gb * 1024)} MB` : `${fmtNum(gb)} GB`);
export const fmtPreco = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const fmtData = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
export const pol = (n: number) => `${fmtNum(n, 1)}"`;

/* ---------- Linhas da tabela de comparação ---------- */
type Melhor = 'maior' | 'menor' | null;
export interface Linha {
  id: string;
  rotulo: string;
  valor: (p: IPhone) => string;
  num?: (p: IPhone) => number | null | undefined; // usado para decidir o melhor
  melhor?: Melhor;
  nota?: string;
}
export interface Grupo { id: string; titulo: string; linhas: Linha[] }

const sim = (b?: boolean) => (b ? 'Sim' : 'Não');
const rank = (s: string, ordem: string[]) => Math.max(0, ordem.findIndex((o) => s.startsWith(o)));

export const GRUPOS: Grupo[] = [
  {
    id: 'geral', titulo: 'Geral', linhas: [
      { id: 'anuncio', rotulo: 'Anúncio', valor: (p) => fmtData(p.anuncio), num: (p) => +p.anuncio.replace(/-/g, ''), melhor: 'maior' },
      { id: 'ios', rotulo: 'Sistema de fábrica', valor: (p) => p.ios.inicial },
      { id: 'iosmax', rotulo: 'Última versão do iOS', valor: (p) => (p.ios.suportado ? `${p.ios.maximo} (recebe atualizações)` : p.ios.maximo), num: (p) => (p.ios.suportado ? 1 : 0), melhor: 'maior' },
      { id: 'preco', rotulo: 'Preço de lançamento (BR)', valor: (p) => fmtPreco(p.preco.lancamentoBR) + (p.preco.ficticio ? ' *' : ''), num: (p) => (p.preco.ficticio ? null : p.preco.lancamentoBR), melhor: 'menor', nota: '* Preço ilustrativo, ainda não confirmado.' },
    ],
  },
  {
    id: 'tela', titulo: 'Tela', linhas: [
      { id: 'tam', rotulo: 'Tamanho', valor: (p) => pol(p.tela.polegadas) + (p.tela.externa ? ` (externa ${pol(p.tela.externa.polegadas)})` : ''), num: (p) => p.tela.polegadas, melhor: 'maior' },
      { id: 'tipo', rotulo: 'Tecnologia', valor: (p) => (p.tela.tipo === 'OLED' ? 'OLED Super Retina' : 'LCD Retina/IPS'), num: (p) => (p.tela.tipo === 'OLED' ? 1 : 0), melhor: 'maior' },
      { id: 'res', rotulo: 'Resolução', valor: (p) => `${p.tela.resolucao[0]} × ${p.tela.resolucao[1]}`, num: (p) => p.tela.resolucao[0] * p.tela.resolucao[1], melhor: 'maior' },
      { id: 'ppi', rotulo: 'Densidade', valor: (p) => `${p.tela.ppi} ppi`, num: (p) => p.tela.ppi, melhor: 'maior' },
      { id: 'hz', rotulo: 'Taxa de atualização', valor: (p) => (p.tela.hz === 120 ? '120 Hz (ProMotion)' : '60 Hz'), num: (p) => p.tela.hz, melhor: 'maior' },
      { id: 'brilho', rotulo: 'Brilho máximo', valor: (p) => (p.tela.brilhoPico ? `${fmtNum(p.tela.brilhoPico)} nits` : '—'), num: (p) => p.tela.brilhoPico, melhor: 'maior' },
      { id: 'aod', rotulo: 'Tela sempre ativa', valor: (p) => sim(p.tela.alwaysOn), num: (p) => (p.tela.alwaysOn ? 1 : 0), melhor: 'maior' },
      { id: 'frente', rotulo: 'Frente', valor: (p) => ({ 'botao-home': 'Botão Início', notch: 'Notch', ilha: 'Dynamic Island', furo: 'Câmera sob a tela / furo' })[p.tela.frente] },
    ],
  },
  {
    id: 'desempenho', titulo: 'Desempenho', linhas: [
      { id: 'chip', rotulo: 'Chip', valor: (p) => p.chip.nome + (p.chip.nm ? ` (${p.chip.nm} nm)` : '') },
      { id: 'cpu', rotulo: 'CPU', valor: (p) => p.chip.cpu },
      { id: 'gpu', rotulo: 'GPU', valor: (p) => p.chip.gpu ?? '—' },
      { id: 'ram', rotulo: 'Memória RAM', valor: (p) => (p.chip.ram ? fmtGB(p.chip.ram) : 'Não divulgada'), num: (p) => p.chip.ram, melhor: 'maior', nota: 'A Apple não divulga a RAM; valores apurados pela imprensa.' },
      { id: 'indice', rotulo: 'Índice de desempenho', valor: (p) => fmtNum(p.chip.indice), num: (p) => p.chip.indice, melhor: 'maior', nota: 'Índice relativo estimado (multi-core).' },
      { id: 'arm', rotulo: 'Armazenamento', valor: (p) => p.armazenamento.map(fmtGB).join(' · '), num: (p) => Math.max(...p.armazenamento), melhor: 'maior' },
      { id: 'ai', rotulo: 'Apple Intelligence', valor: (p) => sim(p.recursos.appleIntelligence), num: (p) => (p.recursos.appleIntelligence ? 1 : 0), melhor: 'maior' },
    ],
  },
  {
    id: 'camera', titulo: 'Câmeras', linhas: [
      { id: 'qtd', rotulo: 'Câmeras traseiras', valor: (p) => `${p.cameras.traseiras.length}`, num: (p) => p.cameras.traseiras.length, melhor: 'maior' },
      { id: 'principal', rotulo: 'Principal', valor: (p) => lente(p, 'principal'), num: (p) => p.cameras.traseiras[0].mp, melhor: 'maior' },
      { id: 'ultra', rotulo: 'Ultra-angular', valor: (p) => lente(p, 'ultra-angular'), num: (p) => p.cameras.traseiras.find((l) => l.tipo === 'ultra-angular')?.mp ?? 0, melhor: 'maior' },
      { id: 'tele', rotulo: 'Teleobjetiva', valor: (p) => lente(p, 'teleobjetiva'), num: (p) => p.cameras.zoomOtico ?? 0, melhor: 'maior' },
      { id: 'frontal', rotulo: 'Câmera frontal', valor: (p) => (p.cameras.frontal ? `${fmtNum(p.cameras.frontal, p.cameras.frontal < 1 ? 1 : 0)} MP` : 'Não tem'), num: (p) => p.cameras.frontal ?? 0, melhor: 'maior' },
      { id: 'video', rotulo: 'Vídeo', valor: (p) => p.cameras.video, num: (p) => videoNota(p.cameras.video), melhor: 'maior' },
      { id: 'lidar', rotulo: 'Scanner LiDAR', valor: (p) => sim(p.cameras.lidar), num: (p) => (p.cameras.lidar ? 1 : 0), melhor: 'maior' },
    ],
  },
  {
    id: 'bateria', titulo: 'Bateria e recarga', linhas: [
      { id: 'mah', rotulo: 'Capacidade', valor: (p) => (p.bateria.mah ? `${fmtNum(p.bateria.mah)} mAh` : 'Não divulgada'), num: (p) => p.bateria.mah, melhor: 'maior', nota: 'A Apple não divulga mAh; valores de registros oficiais e imprensa.' },
      { id: 'video', rotulo: 'Reprodução de vídeo', valor: (p) => (p.bateria.videoHoras ? `até ${p.bateria.videoHoras} h` : '—'), num: (p) => p.bateria.videoHoras, melhor: 'maior' },
      { id: 'cabo', rotulo: 'Recarga com fio', valor: (p) => (p.bateria.caboW ? `até ${fmtNum(p.bateria.caboW)} W` : '—'), num: (p) => p.bateria.caboW, melhor: 'maior' },
      { id: 'semfio', rotulo: 'Recarga sem fio', valor: (p) => (p.bateria.semFioW ? `até ${fmtNum(p.bateria.semFioW, p.bateria.semFioW % 1 ? 1 : 0)} W${p.bateria.magsafe ? ' (MagSafe)' : ' (Qi)'}` : 'Não tem'), num: (p) => p.bateria.semFioW ?? 0, melhor: 'maior' },
    ],
  },
  {
    id: 'corpo', titulo: 'Design e corpo', linhas: [
      { id: 'dim', rotulo: 'Dimensões', valor: (p) => `${fmtNum(p.corpo.altura, 1)} × ${fmtNum(p.corpo.largura, 1)} × ${fmtNum(p.corpo.espessura, 2)} mm` + (p.corpo.aberto ? ` (aberto: ${fmtNum(p.corpo.aberto.largura, 1)} mm de largura)` : '') },
      { id: 'esp', rotulo: 'Espessura', valor: (p) => `${fmtNum(p.corpo.espessura, 2)} mm`, num: (p) => p.corpo.espessura, melhor: 'menor' },
      { id: 'peso', rotulo: 'Peso', valor: (p) => `${p.corpo.peso} g`, num: (p) => p.corpo.peso, melhor: 'menor' },
      { id: 'mat', rotulo: 'Estrutura', valor: (p) => p.corpo.material },
      { id: 'tras', rotulo: 'Traseira', valor: (p) => p.corpo.traseira },
      { id: 'ip', rotulo: 'Resistência à água', valor: (p) => p.corpo.ip ?? 'Sem certificação', num: (p) => ({ IP67: 1, IP68: 2 } as Record<string, number>)[p.corpo.ip ?? ''] ?? 0, melhor: 'maior' },
      { id: 'cores', rotulo: 'Cores', valor: (p) => p.cores.map((c) => c.nome).join(', ') },
    ],
  },
  {
    id: 'conexao', titulo: 'Conectividade e recursos', linhas: [
      { id: 'rede', rotulo: 'Rede móvel', valor: (p) => p.conectividade.rede, num: (p) => rank(p.conectividade.rede, ['2G', '3G', '4G', '5G']), melhor: 'maior' },
      { id: 'conector', rotulo: 'Conector', valor: (p) => p.conectividade.conector + (p.conectividade.usb && p.conectividade.conector !== '30 pinos' ? ` · ${p.conectividade.usb}` : '') },
      { id: 'wifi', rotulo: 'Wi-Fi', valor: (p) => p.conectividade.wifi, num: (p) => wifiNota(p.conectividade.wifi), melhor: 'maior' },
      { id: 'bt', rotulo: 'Bluetooth', valor: (p) => p.conectividade.bluetooth, num: (p) => parseFloat(p.conectividade.bluetooth), melhor: 'maior' },
      { id: 'nfc', rotulo: 'NFC / Apple Pay', valor: (p) => sim(p.conectividade.nfc), num: (p) => (p.conectividade.nfc ? 1 : 0), melhor: 'maior' },
      { id: 'sim', rotulo: 'Chip', valor: (p) => (p.conectividade.esimOnly ? 'Só eSIM' : p.ano >= 2018 ? 'Nano-SIM e eSIM' : 'Nano/Micro/Mini-SIM') },
      { id: 'sat', rotulo: 'Emergência via satélite', valor: (p) => sim(p.conectividade.satelite), num: (p) => (p.conectividade.satelite ? 1 : 0), melhor: 'maior' },
      { id: 'bio', rotulo: 'Biometria', valor: (p) => p.biometria },
      { id: 'acao', rotulo: 'Botão de Ação', valor: (p) => sim(p.recursos.botaoAcao), num: (p) => (p.recursos.botaoAcao ? 1 : 0), melhor: 'maior' },
      { id: 'ctrl', rotulo: 'Controle da Câmera', valor: (p) => sim(p.recursos.controleCamera), num: (p) => (p.recursos.controleCamera ? 1 : 0), melhor: 'maior' },
      { id: 'p2', rotulo: 'Entrada de fone P2', valor: (p) => sim(p.recursos.fone35) },
    ],
  },
];

function lente(p: IPhone, tipo: string) {
  const l = p.cameras.traseiras.find((x) => x.tipo === tipo);
  if (!l) return 'Não tem';
  return `${l.mp} MP` + (l.abertura ? ` ${l.abertura}` : '') + (l.zoom ? ` · ${l.zoom}` : '');
}
function videoNota(v: string) {
  if (/não grava/i.test(v)) return 0;
  const base = /4K/.test(v) ? 400 : /1080p/.test(v) ? 200 : /720p/.test(v) ? 100 : 50;
  const fps = Number((v.match(/(\d+) fps/) ?? [])[1] ?? 30);
  return base + fps + (/ProRes RAW/.test(v) ? 30 : /ProRes/.test(v) ? 20 : 0);
}
function wifiNota(w: string) {
  if (/7/.test(w)) return 7; if (/6E/.test(w)) return 6.5; if (/6/.test(w)) return 6; if (/ac|5 \(/.test(w)) return 5; if (/802\.11n|4 \(/.test(w)) return 4; return 3;
}

/** Para cada linha, devolve os índices das colunas vencedoras (empate = nenhuma). */
export function vencedores(linha: Linha, ps: IPhone[]): Set<number> {
  if (!linha.num || !linha.melhor || ps.length < 2) return new Set();
  const vals = ps.map((p) => linha.num!(p));
  if (vals.every((v) => v === null || v === undefined)) return new Set();
  const nums = vals.map((v) => (v === null || v === undefined ? (linha.melhor === 'maior' ? -Infinity : Infinity) : v));
  const alvo = linha.melhor === 'maior' ? Math.max(...nums) : Math.min(...nums);
  const idx = nums.map((v, i) => (v === alvo ? i : -1)).filter((i) => i >= 0);
  return idx.length === ps.length ? new Set() : new Set(idx);
}

/* ---------- Notas (0–10) por categoria ---------- */
const max = (f: (p: IPhone) => number) => Math.max(...IPHONES.map(f));
const MAX = {
  indice: max((p) => p.chip.indice),
  video: max((p) => p.bateria.videoHoras ?? 0),
  mah: max((p) => p.bateria.mah ?? 0),
  px: max((p) => p.tela.resolucao[0] * p.tela.resolucao[1]),
};
const lim = (n: number) => Math.max(0, Math.min(10, n));

export function notas(p: IPhone) {
  const desempenho = lim(10 * Math.sqrt(p.chip.indice / MAX.indice));
  const tela = lim(
    (p.tela.tipo === 'OLED' ? 3 : 1) + (p.tela.hz === 120 ? 2 : 0) + 2.2 * Math.sqrt((p.tela.resolucao[0] * p.tela.resolucao[1]) / MAX.px) +
    ((p.tela.brilhoPico ?? 400) / 3000) * 1.8 + (p.tela.alwaysOn ? 1 : 0),
  );
  const tele = p.cameras.zoomOtico ?? 0;
  const camera = lim(
    p.cameras.traseiras.reduce((s, l) => s + Math.log2(1 + l.mp) * 0.55, 0) + Math.min(2, tele / 2.5) + (p.cameras.lidar ? 0.6 : 0) +
    videoNota(p.cameras.video) / 160 + (p.cameras.frontal ? Math.log2(1 + p.cameras.frontal) * 0.25 : 0),
  );
  const horas = p.bateria.videoHoras ?? (p.bateria.mah ? (p.bateria.mah / MAX.mah) * MAX.video * 0.55 : 5);
  const bateria = lim((horas / MAX.video) * 8 + Math.min(1.4, (p.bateria.caboW ?? 5) / 45) + (p.bateria.magsafe ? 0.6 : p.bateria.semFioW ? 0.3 : 0));
  const geral = (desempenho * 0.3 + tela * 0.2 + camera * 0.3 + bateria * 0.2);
  return { geral, desempenho, tela, camera, bateria };
}

/* ---------- Pares de comparação com página própria (SEO) ---------- */
const parSlug = (a: IPhone, b: IPhone) => {
  const [x, y] = [a, b].sort((m, n) => m.geracao - n.geracao);
  return `${x.slug}-vs-${y.slug}`;
};
export { parSlug };

export function antecessor(p: IPhone): IPhone | undefined {
  const mesmaLinha = IPHONES.filter((x) => x.geracao < p.geracao && mesmaFamilia(x, p));
  return mesmaLinha[mesmaLinha.length - 1];
}
export function sucessor(p: IPhone): IPhone | undefined {
  return IPHONES.find((x) => x.geracao > p.geracao && mesmaFamilia(x, p));
}
function mesmaFamilia(a: IPhone, b: IPhone) {
  const grupo = (l: string) => ({ original: 'base', xr: 'base', mini: 'base', e: 'se', air: 'plus', dobravel: 'promax' } as Record<string, string>)[l] ?? l;
  return grupo(a.linha) === grupo(b.linha);
}

export function paresPopulares(): [IPhone, IPhone][] {
  const set = new Map<string, [IPhone, IPhone]>();
  const add = (a?: IPhone, b?: IPhone) => { if (a && b && a.slug !== b.slug) set.set(parSlug(a, b), a.geracao < b.geracao ? [a, b] : [b, a]); };
  const recentes = IPHONES.filter((p) => p.ano >= IPHONES[IPHONES.length - 1].ano - 1);
  for (const p of IPHONES) {
    add(antecessor(p), p);
    IPHONES.filter((x) => x.ano === p.ano && x.slug !== p.slug).forEach((x) => add(p, x));
    if (p.ios.suportado) recentes.forEach((r) => add(p, r));
  }
  return [...set.values()];
}

export function parDeSlug(s: string): [IPhone, IPhone] | null {
  const [a, b] = s.split('-vs-');
  const pa = POR_SLUG.get(a), pb = POR_SLUG.get(b);
  return pa && pb ? [pa, pb] : null;
}

/* ---------- Diferenças em linguagem simples ---------- */
export function diferencas(a: IPhone, b: IPhone): string[] {
  const d: string[] = [];
  const [velho, novo] = a.geracao < b.geracao ? [a, b] : [b, a];
  const n = novo.nome, v = velho.nome;
  const x = novo.chip.indice / velho.chip.indice;
  if (x > 1.08) d.push(`O ${n} é cerca de ${x >= 2 ? fmtNum(x, 1) + 'x' : fmtNum((x - 1) * 100) + '%'} mais rápido (${novo.chip.nome} contra ${velho.chip.nome}).`);
  if (novo.tela.polegadas !== velho.tela.polegadas) d.push(`Tela de ${pol(novo.tela.polegadas)} no ${n} e ${pol(velho.tela.polegadas)} no ${v}.`);
  if (novo.tela.hz !== velho.tela.hz) d.push(`${novo.tela.hz > velho.tela.hz ? n : v} tem tela de 120 Hz (ProMotion), mais fluida ao rolar.`);
  if (novo.tela.tipo !== velho.tela.tipo) d.push(`${novo.tela.tipo === 'OLED' ? n : v} usa OLED, com pretos reais e mais contraste.`);
  const hv = velho.bateria.videoHoras, hn = novo.bateria.videoHoras;
  if (hv && hn && Math.abs(hn - hv) >= 2) d.push(`${hn > hv ? n : v} aguenta ${Math.abs(hn - hv)} h a mais de vídeo (${Math.max(hn, hv)} h contra ${Math.min(hn, hv)} h).`);
  const ca = velho.cameras.traseiras.length, cn = novo.cameras.traseiras.length;
  if (ca !== cn) d.push(`${cn > ca ? n : v} tem ${Math.max(ca, cn)} câmeras traseiras; o outro tem ${Math.min(ca, cn)}.`);
  if ((novo.cameras.zoomOtico ?? 0) !== (velho.cameras.zoomOtico ?? 0)) {
    const z = Math.max(novo.cameras.zoomOtico ?? 0, velho.cameras.zoomOtico ?? 0);
    d.push(`Zoom óptico de até ${fmtNum(z, z % 1 ? 1 : 0)}x no ${(novo.cameras.zoomOtico ?? 0) > (velho.cameras.zoomOtico ?? 0) ? n : v}.`);
  }
  if (novo.conectividade.conector !== velho.conectividade.conector) d.push(`Conector ${novo.conectividade.conector} no ${n}; ${velho.conectividade.conector} no ${v}.`);
  if (novo.biometria !== velho.biometria) d.push(`Desbloqueio por ${novo.biometria} no ${n} e ${velho.biometria === 'Nenhuma' ? 'sem biometria' : velho.biometria} no ${v}.`);
  if (novo.recursos.dynamicIsland && !velho.recursos.dynamicIsland) d.push(`Só o ${n} tem Dynamic Island.`);
  if (novo.recursos.appleIntelligence && !velho.recursos.appleIntelligence) d.push(`Só o ${n} roda Apple Intelligence.`);
  if (novo.ios.suportado && !velho.ios.suportado) d.push(`O ${v} não recebe mais atualizações (parou no ${velho.ios.maximo}).`);
  const dp = novo.corpo.peso - velho.corpo.peso;
  if (Math.abs(dp) >= 10) d.push(`${dp > 0 ? v : n} é ${Math.abs(dp)} g mais leve.`);
  return d.slice(0, 7);
}
