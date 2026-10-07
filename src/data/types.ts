export type Linha = 'original' | 'base' | 'mini' | 'plus' | 'pro' | 'promax' | 'se' | 'e' | 'xr' | 'air' | 'dobravel';

export type LayoutCamera =
  | 'canto' // 1 lente no canto (2007–2016 e SE)
  | 'canto-flash' // 1 lente + flash (4 em diante)
  | 'dupla-h' // 7 Plus / 8 Plus
  | 'dupla-v' // X / XS
  | 'quadrado-2v' // 11 / 12
  | 'quadrado-2d' // 13 / 14 / 15 (diagonal)
  | 'quadrado-3' // 11 Pro … 16 Pro
  | 'capsula-v' // 16 / 16 Plus / 17
  | 'barra' // Air (barra horizontal)
  | 'plato' // 17 Pro / 18 Pro (plataforma de lado a lado)
  | 'capsula-h'; // Duo

export type Frente = 'botao-home' | 'notch' | 'ilha' | 'furo';

export interface Cor { nome: string; hex: string }

export interface Lente { tipo: 'principal' | 'ultra-angular' | 'teleobjetiva'; mp: number; abertura?: string; zoom?: string }

export interface IPhone {
  slug: string;
  nome: string;
  linha: Linha;
  ano: number;
  anuncio: string; // AAAA-MM-DD (data do anúncio)
  geracao: number; // ordem de lançamento, usado para sucessor/antecessor
  resumo: string;

  chip: { nome: string; nm?: number; cpu: string; gpu?: string; ram?: number | null; indice: number };
  armazenamento: number[]; // GB

  tela: {
    polegadas: number; tipo: 'LCD' | 'OLED'; resolucao: [number, number]; ppi: number;
    hz: 60 | 120; brilhoPico?: number; alwaysOn?: boolean; frente: Frente;
    externa?: { polegadas: number; resolucao: [number, number]; ppi: number };
  };

  cameras: { traseiras: Lente[]; frontal: number | null; video: string; lidar?: boolean; zoomOtico?: number };

  bateria: { mah?: number | null; videoHoras?: number | null; caboW?: number | null; semFioW?: number | null; magsafe?: boolean };

  corpo: {
    altura: number; largura: number; espessura: number; peso: number;
    aberto?: { largura: number; espessura: number };
    material: string; traseira: string; ip?: string | null; raio: number;
  };

  conectividade: { rede: '2G' | '3G' | '4G' | '5G'; conector: '30 pinos' | 'Lightning' | 'USB-C'; usb?: string; wifi: string; bluetooth: string; nfc: boolean; esimOnly?: boolean; satelite?: boolean };

  biometria: 'Nenhuma' | 'Touch ID' | 'Face ID';
  recursos: { fone35?: boolean; botaoAcao?: boolean; controleCamera?: boolean; appleIntelligence?: boolean; dynamicIsland?: boolean; deteccaoAcidente?: boolean };

  ios: { inicial: string; maximo: string; suportado: boolean };
  cores: Cor[];
  layoutCamera: LayoutCamera;

  // Preço: preenchido depois. Enquanto `ficticio` for true, o valor é ilustrativo e não entra no SEO.
  preco: { lancamentoBR: number; ficticio: boolean };
}
