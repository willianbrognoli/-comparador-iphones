import { BoxGeometry, BufferAttribute, CanvasTexture, CircleGeometry, Color, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, RingGeometry, SRGBColorSpace, Shape, ShapeGeometry } from 'three';
import type { IPhone } from '@/data/types';

/*
 * Constrói um iPhone por código a partir das medidas reais (1 unidade = 10 mm).
 * Nada de arquivos .glb nem arte da Apple: geometria leve e reaproveitável.
 */
const U = 0.1; // mm -> unidades

function retArredondado(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function clarear(hex: string, f: number) {
  const c = new Color(hex); const hsl = { h: 0, s: 0, l: 0 }; c.getHSL(hsl);
  return new Color().setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + f)));
}

function texturaTela(p: IPhone, cor: string, w: number, h: number) {
  const cv = document.createElement('canvas');
  const k = 512 / Math.max(w, h);
  cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  const g = cv.getContext('2d')!;
  // fundo: vidro escuro com brilho na cor do aparelho
  const grad = g.createLinearGradient(0, 0, cv.width, cv.height);
  grad.addColorStop(0, '#0b0d12'); grad.addColorStop(1, '#141822');
  g.fillStyle = grad; g.fillRect(0, 0, cv.width, cv.height);
  const glow = g.createRadialGradient(cv.width * 0.3, cv.height * 0.72, 0, cv.width * 0.3, cv.height * 0.72, cv.height * 0.7);
  glow.addColorStop(0, `#${clarear(cor, 0.12).getHexString()}cc`); glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow; g.fillRect(0, 0, cv.width, cv.height);
  const glow2 = g.createRadialGradient(cv.width * 0.85, cv.height * 0.15, 0, cv.width * 0.85, cv.height * 0.15, cv.height * 0.5);
  glow2.addColorStop(0, 'rgba(120,150,255,0.35)'); glow2.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow2; g.fillRect(0, 0, cv.width, cv.height);
  // relógio de bloqueio
  g.fillStyle = 'rgba(255,255,255,0.92)';
  g.font = `600 ${Math.round(cv.width * 0.2)}px system-ui, sans-serif`; g.textAlign = 'center';
  g.fillText('9:41', cv.width / 2, cv.height * 0.24);
  g.font = `500 ${Math.round(cv.width * 0.05)}px system-ui, sans-serif`; g.fillStyle = 'rgba(255,255,255,0.7)';
  g.fillText(String(p.ano), cv.width / 2, cv.height * 0.11);
  // recortes
  g.fillStyle = '#000';
  const f = p.tela.frente;
  if (f === 'notch') {
    const nw = cv.width * (p.ano >= 2021 ? 0.4 : 0.5), nh = cv.height * 0.035;
    g.beginPath(); g.roundRect((cv.width - nw) / 2, -nh, nw, nh * 2, nh * 0.9); g.fill();
  } else if (f === 'ilha') {
    const nw = cv.width * 0.3, nh = cv.height * 0.028;
    g.beginPath(); g.roundRect((cv.width - nw) / 2, cv.height * 0.018, nw, nh, nh / 2); g.fill();
  } else if (f === 'furo') {
    g.beginPath(); g.arc(cv.width * 0.5, cv.height * 0.03, cv.width * 0.022, 0, Math.PI * 2); g.fill();
  }
  const t = new CanvasTexture(cv); t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export interface OpcoesPhone { cor: string }

export function criarIPhone(p: IPhone, { cor }: OpcoesPhone) {
  const grupo = new Group();
  grupo.name = p.slug;
  const W = p.corpo.largura * U, H = p.corpo.altura * U, D = p.corpo.espessura * U;
  const R = p.corpo.raio * U;
  const bordaRedonda = (p.ano >= 2014 && p.ano <= 2019 && p.linha !== 'se') || p.ano <= 2009 || p.linha === 'xr';
  const bevel = bordaRedonda ? D * 0.42 : D * 0.12;

  const metal = p.corpo.material.toLowerCase();
  const corBase = new Color(cor);
  const matCorpo = new MeshPhysicalMaterial({
    color: corBase,
    metalness: /alum|tit|aço/.test(metal) ? 0.75 : 0.05,
    roughness: /fosco|alum|tit/.test(p.corpo.traseira.toLowerCase() + metal) ? 0.38 : 0.18,
    clearcoat: /vidro|ceramic|policarb|plást/i.test(p.corpo.traseira) ? 0.8 : 0.2,
    clearcoatRoughness: 0.2,
  });

  // corpo
  const forma = retArredondado(W - bevel * 2, H - bevel * 2, Math.max(0.02, R - bevel));
  const geo = new ExtrudeGeometry(forma, { depth: D - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: bordaRedonda ? 6 : 2, curveSegments: 18 });
  geo.translate(0, 0, -(D - bevel * 2) / 2);
  const corpo = new Mesh(geo, matCorpo);
  grupo.add(corpo);

  // tela (frente)
  const homeBtn = p.tela.frente === 'botao-home';
  const bordaLat = homeBtn ? W * 0.07 : W * 0.035;
  const topo = homeBtn ? H * 0.14 : W * 0.035;
  const base = homeBtn ? H * 0.14 : W * 0.035;
  const sw = W - bordaLat * 2, sh = H - topo - base;
  const telaGeo = new ShapeGeometry(retArredondado(sw, sh, homeBtn ? 0.05 : Math.max(0.05, R - bordaLat * 0.8)), 18);
  // UV para a textura
  const pos = telaGeo.attributes.position as BufferAttribute;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) { uv[i * 2] = pos.getX(i) / sw + 0.5; uv[i * 2 + 1] = pos.getY(i) / sh + 0.5; }
  telaGeo.setAttribute('uv', new BufferAttribute(uv, 2));
  const tela = new Mesh(telaGeo, new MeshBasicMaterial({ map: texturaTela(p, cor, sw, sh), toneMapped: false }));
  tela.position.set(0, (base - topo) / 2, D / 2 + 0.03);
  grupo.add(tela);
  // moldura frontal preta
  const molduraGeo = new ShapeGeometry(retArredondado(W - bevel * 0.9, H - bevel * 0.9, Math.max(0.02, R - bevel * 0.45)), 18);
  const moldura = new Mesh(molduraGeo, new MeshStandardMaterial({ color: homeBtn && corBase.getHSL({ h: 0, s: 0, l: 0 }).l > 0.6 ? '#f4f4f2' : '#08090b', roughness: 0.15, metalness: 0.1 }));
  moldura.position.z = D / 2 + 0.015;
  grupo.add(moldura);

  if (homeBtn) {
    const anel = new Mesh(new RingGeometry(W * 0.075, W * 0.085, 40), new MeshStandardMaterial({ color: '#9aa0a8', metalness: 0.8, roughness: 0.3 }));
    anel.position.set(0, -H / 2 + base / 2, D / 2 + 0.035);
    const botao = new Mesh(new CircleGeometry(W * 0.075, 40), new MeshStandardMaterial({ color: '#15171b', roughness: 0.4 }));
    botao.position.copy(anel.position);
    grupo.add(anel, botao);
  }

  // traseira: módulo de câmeras
  grupo.add(moduloCamera(p, W, H, D, corBase));

  // botões laterais
  const matBotao = new MeshStandardMaterial({ color: clarear(cor, -0.05), metalness: 0.8, roughness: 0.3 });
  const botao = (y: number, h: number, lado: number) => {
    const b = new Mesh(new BoxGeometry(0.06, h, D * 0.35), matBotao);
    b.position.set(lado * (W / 2 + 0.01), y, 0); return b;
  };
  grupo.add(botao(H * 0.24, H * 0.06, -1), botao(H * 0.15, H * 0.06, -1), botao(H * 0.2, H * 0.1, 1));
  if (p.recursos.botaoAcao) grupo.add(botao(H * 0.34, H * 0.035, -1));
  if (p.recursos.controleCamera) grupo.add(botao(-H * 0.12, H * 0.07, 1));

  return grupo;
}

function moduloCamera(p: IPhone, W: number, H: number, D: number, corBase: Color) {
  const g = new Group();
  const zBack = -D / 2 - 0.001;
  const matLente = new MeshPhysicalMaterial({ color: '#05060a', roughness: 0.05, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
  const matAnel = new MeshStandardMaterial({ color: corBase.clone().lerp(new Color('#9aa0a8'), 0.5), metalness: 0.9, roughness: 0.25 });
  const matPlato = new MeshPhysicalMaterial({ color: corBase.clone().offsetHSL(0, 0, -0.04), metalness: 0.5, roughness: 0.3, clearcoat: 0.6 });
  const matFlash = new MeshStandardMaterial({ color: '#f3e9cf', emissive: '#3a3528', roughness: 0.3 });

  const lente = (x: number, y: number, r: number, alto = 0.06) => {
    const anel = new Mesh(new CylinderGeometry(r * 1.18, r * 1.18, alto, 36), matAnel);
    anel.rotation.x = Math.PI / 2; anel.position.set(x, y, zBack - alto / 2);
    const vidro = new Mesh(new CylinderGeometry(r, r, alto + 0.01, 36), matLente);
    vidro.rotation.x = Math.PI / 2; vidro.position.set(x, y, zBack - alto / 2 - 0.004);
    g.add(anel, vidro);
  };
  const flash = (x: number, y: number, r: number) => {
    const f = new Mesh(new CircleGeometry(r, 24), matFlash);
    f.position.set(x, y, zBack - 0.002); f.rotation.y = Math.PI; g.add(f);
  };
  const plato = (w: number, h: number, r: number, cx: number, cy: number, alto = 0.12) => {
    const geo = new ExtrudeGeometry(retArredondado(w, h, r), { depth: alto, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 14 });
    const m = new Mesh(geo, matPlato); m.position.set(cx, cy, zBack - alto - 0.02); g.add(m);
    return zBack - alto - 0.02;
  };

  // canto superior esquerdo visto de trás = +x no espaço local (o aparelho está de frente para +z)
  const cx = W / 2, cy = H / 2;
  const m = W * 0.06;
  switch (p.layoutCamera) {
    case 'canto': lente(cx - m - W * 0.04, cy - m - W * 0.04, W * 0.035, 0.02); break;
    case 'canto-flash': lente(cx - m - W * 0.05, cy - m - W * 0.05, W * 0.05, p.ano >= 2015 ? 0.07 : 0.02); flash(cx - m - W * 0.17, cy - m - W * 0.05, W * 0.025); break;
    case 'dupla-h': {
      const z = plato(W * 0.33, W * 0.15, W * 0.075, cx - m - W * 0.165, cy - m - W * 0.075, 0.03);
      void z; lente(cx - m - W * 0.08, cy - m - W * 0.075, W * 0.05); lente(cx - m - W * 0.25, cy - m - W * 0.075, W * 0.05); flash(cx - m - W * 0.165, cy - m - W * 0.075, W * 0.02); break;
    }
    case 'dupla-v': {
      plato(W * 0.15, W * 0.33, W * 0.075, cx - m - W * 0.075, cy - m - W * 0.165, 0.06);
      lente(cx - m - W * 0.075, cy - m - W * 0.08, W * 0.05, 0.14); lente(cx - m - W * 0.075, cy - m - W * 0.25, W * 0.05, 0.14); flash(cx - m - W * 0.2, cy - m - W * 0.165, W * 0.02); break;
    }
    case 'quadrado-2v': case 'quadrado-2d': case 'quadrado-3': {
      const s = W * 0.42; const ox = cx - m * 0.6 - s / 2, oy = cy - m * 0.6 - s / 2;
      plato(s, s, s * 0.24, ox, oy, 0.1);
      const r = s * 0.17; const off = s * 0.24;
      if (p.layoutCamera === 'quadrado-3') { lente(ox + off, oy + off, r, 0.24); lente(ox + off, oy - off, r, 0.24); lente(ox - off, oy, r, 0.24); flash(ox - off, oy + off, r * 0.35); }
      else if (p.layoutCamera === 'quadrado-2v') { lente(ox + off, oy + off, r, 0.22); lente(ox + off, oy - off, r, 0.22); flash(ox - off, oy + off, r * 0.35); }
      else { lente(ox + off, oy + off, r, 0.22); lente(ox - off, oy - off, r, 0.22); flash(ox - off, oy + off, r * 0.35); }
      break;
    }
    case 'capsula-v': {
      const w = W * 0.2, h = W * 0.42; const ox = cx - m - w / 2, oy = cy - m - h / 2;
      plato(w, h, w / 2, ox, oy, 0.1); lente(ox, oy + h * 0.24, w * 0.36, 0.22); lente(ox, oy - h * 0.24, w * 0.36, 0.22); flash(ox - w * 0.95, oy + h * 0.3, w * 0.12); break;
    }
    case 'barra': {
      const h = W * 0.22; const oy = cy - m * 0.9 - h / 2;
      plato(W * 0.92, h, h / 2, 0, oy, 0.12); lente(cx - m - W * 0.12, oy, h * 0.34, 0.26); flash(-W * 0.25, oy, h * 0.1); break;
    }
    case 'plato': {
      const h = W * 0.45; const oy = cy - m * 0.5 - h / 2;
      plato(W * 0.96, h, W * 0.12, 0, oy, 0.1);
      const r = W * 0.075, colX = cx - m - W * 0.1;
      lente(colX, oy + h * 0.25, r, 0.26); lente(colX, oy - h * 0.25, r, 0.26); lente(colX - W * 0.2, oy, r, 0.26); flash(-W * 0.2, oy + h * 0.22, r * 0.4); break;
    }
    case 'capsula-h': {
      const w = W * 0.42, h = W * 0.2; const ox = cx - m - w / 2, oy = cy - m - h / 2;
      plato(w, h, h / 2, ox, oy, 0.1); lente(ox + w * 0.24, oy, h * 0.36, 0.22); lente(ox - w * 0.24, oy, h * 0.36, 0.22); break;
    }
  }
  return g;
}

export function descartar(obj: Object3D) {
  obj.traverse((o) => {
    const m = o as Mesh;
    if (m.geometry) m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    mats.forEach((mt) => { const mm = mt as MeshBasicMaterial; mm.map?.dispose(); mm.dispose(); });
  });
}
