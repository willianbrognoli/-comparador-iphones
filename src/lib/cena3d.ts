import { ACESFilmicToneMapping, Box3, DirectionalLight, Group, HemisphereLight, PMREMGenerator, PerspectiveCamera, SRGBColorSpace, Scene, Vector3, WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { criarIPhone, descartar } from './phone3d';
import type { ItemCena } from '@/components/Phone3D';

interface Opcoes { autoGiro: boolean; aoPronto: () => void; vista?: 'frente' | 'tras' }

export function montarCena(host: HTMLElement, itensIniciais: ItemCena[], op: Opcoes) {
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const cena = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environment = env;
  const luz = new DirectionalLight('#ffffff', 1.6); luz.position.set(4, 6, 8); cena.add(luz);
  cena.add(new HemisphereLight('#ffffff', '#b9c2d0', 0.7));

  const camera = new PerspectiveCamera(28, 1, 1, 120);
  const raiz = new Group(); cena.add(raiz);

  const ini = op.vista === 'tras' ? Math.PI - 0.55 : -0.5;
  let alvoRotY = ini, rotY = ini, alvoRotX = 0.08, rotX = 0.08, vel = 0;
  let arrastando = false, ultX = 0, ultY = 0, ultimoToque = 0;
  let escalaEntrada = 1, visivel = true, raf = 0, destruido = false;
  let distancia = 10;

  function enquadrar() {
    const box = new Box3().setFromObject(raiz);
    const tam = box.getSize(new Vector3());
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    const fov = (camera.fov * Math.PI) / 180;
    const dH = (tam.y * 1.18) / (2 * Math.tan(fov / 2));
    const dW = (Math.max(tam.x, tam.z) * 1.18) / (2 * Math.tan(fov / 2) * (w / h));
    distancia = Math.max(dH, dW) + tam.z;
    camera.position.set(0, 0, distancia);
    camera.lookAt(0, 0, 0);
  }

  function montar(itens: ItemCena[]) {
    raiz.children.slice().forEach((c) => { raiz.remove(c); descartar(c); });
    const modelos = itens.map((i) => criarIPhone(i.p, { cor: i.cor }));
    const gap = 1.4;
    const larguras = itens.map((i) => i.p.corpo.largura * 0.1);
    const total = larguras.reduce((s, l) => s + l, 0) + gap * (itens.length - 1);
    let x = -total / 2;
    modelos.forEach((m, k) => {
      const l = larguras[k];
      // alinha pela base para comparar alturas reais
      const hMax = Math.max(...itens.map((i) => i.p.corpo.altura * 0.1));
      m.position.set(x + l / 2, (itens[k].p.corpo.altura * 0.1 - hMax) / 2, 0);
      x += l + gap;
      raiz.add(m);
    });
    enquadrar();
    escalaEntrada = reduzir ? 1 : 0.86;
  }

  function redimensionar() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    camera.aspect = w / h; camera.updateProjectionMatrix();
    enquadrar(); pedir();
  }

  function quadro(t: number) {
    raf = 0;
    if (destruido) return;
    const ocioso = !arrastando && performance.now() - ultimoToque > 2500;
    if (op.autoGiro && ocioso && !reduzir) alvoRotY += 0.0035;
    if (!arrastando && Math.abs(vel) > 0.0001) { alvoRotY += vel; vel *= 0.92; }
    rotY += (alvoRotY - rotY) * 0.12;
    rotX += (alvoRotX - rotX) * 0.12;
    escalaEntrada += (1 - escalaEntrada) * 0.12;
    raiz.children.forEach((m, i) => { m.rotation.set(rotX, rotY, 0); m.position.z = reduzir ? 0 : Math.sin(t / 900 + i) * 0.06; });
    raiz.scale.setScalar(escalaEntrada);
    renderer.render(cena, camera);
    const animando = Math.abs(alvoRotY - rotY) > 0.0005 || Math.abs(1 - escalaEntrada) > 0.001 || Math.abs(vel) > 0.0001;
    if (visivel && (animando || (op.autoGiro && !reduzir))) pedir();
  }
  const pedir = () => { if (!raf && !destruido) raf = requestAnimationFrame(quadro); };

  const el = renderer.domElement;
  el.style.touchAction = 'pan-y';
  const down = (e: PointerEvent) => { arrastando = true; ultX = e.clientX; ultY = e.clientY; vel = 0; el.setPointerCapture(e.pointerId); host.classList.add('girando'); };
  const move = (e: PointerEvent) => {
    if (!arrastando) return;
    const dx = (e.clientX - ultX) / host.clientWidth * 4, dy = (e.clientY - ultY) / host.clientHeight * 2;
    alvoRotY += dx; vel = dx * 0.6; alvoRotX = Math.max(-0.6, Math.min(0.6, alvoRotX + dy));
    ultX = e.clientX; ultY = e.clientY; ultimoToque = performance.now(); pedir();
  };
  const up = () => { arrastando = false; ultimoToque = performance.now(); host.classList.remove('girando'); pedir(); };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('dblclick', () => { alvoRotY = Math.round(alvoRotY / Math.PI) * Math.PI + (Math.round(alvoRotY / Math.PI) % 2 ? 0 : Math.PI); pedir(); });

  const ro = new ResizeObserver(redimensionar); ro.observe(host);
  const vis = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) pedir(); });
  vis.observe(host);
  const aoOcultar = () => { visivel = document.visibilityState === 'visible'; if (visivel) pedir(); };
  document.addEventListener('visibilitychange', aoOcultar);

  montar(itensIniciais); redimensionar(); pedir();
  requestAnimationFrame(() => op.aoPronto());

  return {
    atualizar(itens: ItemCena[]) { montar(itens); pedir(); },
    destruir() {
      destruido = true; cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect();
      document.removeEventListener('visibilitychange', aoOcultar);
      raiz.children.forEach(descartar); env.dispose(); pmrem.dispose(); renderer.dispose(); el.remove();
    },
  };
}
