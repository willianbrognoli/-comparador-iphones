export const SITE = {
  nome: 'Versus',
  slogan: 'Comparador de iPhones',
  descricao: 'Compare todos os iPhones, do primeiro (2007) ao iPhone 18 Pro e iPhone Duo: tela, chip, câmeras, bateria, tamanho real em 3D e suporte ao iOS.',
  // Troque pelo domínio final (sem barra no fim). Usado em canonical, sitemap e Open Graph.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seu-usuario.github.io/comparador-iphones').replace(/\/$/, ''),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  atualizado: '2026-10-06',
};

export const abs = (caminho: string) => `${SITE.url}${caminho}`;

/** Luminância relativa (0–1) de uma cor hex. */
export function luminancia(hex: string) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const ehClara = (hex: string) => luminancia(hex) > 0.55;

/** Versão da cor segura para texto/realce sobre fundo claro. */
export function corTinta(hex: string) {
  let n = hex.replace('#', '');
  let [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  let guard = 0;
  while (luminancia('#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')) > 0.18 && guard++ < 40) {
    r = Math.round(r * 0.9); g = Math.round(g * 0.9); b = Math.round(b * 0.9);
  }
  n = [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return '#' + n;
}

/** Paleta de destaque por coluna quando o usuário não escolhe cor. */
export const CORES_COLUNA = ['#2747F5', '#E0573B', '#0E9F6E'];
