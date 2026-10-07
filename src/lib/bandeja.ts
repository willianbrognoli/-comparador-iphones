'use client';
import { useSyncExternalStore } from 'react';

// Lista de iPhones escolhidos para comparar (até 3), guardada no navegador.
const CHAVE = 'versus:bandeja';
const MAX = 3;
const ouvintes = new Set<() => void>();
let cache: string[] | null = null;

function ler(): string[] {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(CHAVE) ?? '[]'); } catch { cache = []; }
  if (!Array.isArray(cache)) cache = [];
  return cache!;
}
function gravar(v: string[]) {
  cache = v.slice(0, MAX);
  try { localStorage.setItem(CHAVE, JSON.stringify(cache)); } catch { /* modo privado */ }
  ouvintes.forEach((f) => f());
}
const VAZIO: string[] = [];
export const bandeja = {
  alternar(slug: string) { const a = ler(); gravar(a.includes(slug) ? a.filter((s) => s !== slug) : [...a, slug].slice(-MAX)); },
  remover(slug: string) { gravar(ler().filter((s) => s !== slug)); },
  limpar() { gravar([]); },
};
export function useBandeja() {
  return useSyncExternalStore(
    (f) => { ouvintes.add(f); const s = (e: StorageEvent) => { if (e.key === CHAVE) { cache = null; f(); } }; window.addEventListener('storage', s); return () => { ouvintes.delete(f); window.removeEventListener('storage', s); }; },
    ler,
    () => VAZIO,
  );
}
