'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { POR_SLUG } from '@/data/iphones';
import { bandeja, useBandeja } from '@/lib/bandeja';
import { urlComparacao } from '@/lib/rotas';

export default function Bandeja() {
  const itens = useBandeja();
  const rota = usePathname();
  const on = itens.length > 0 && !rota?.startsWith('/comparar');
  return (
    <aside className={`bandeja ${on ? 'on' : ''}`} aria-label="iPhones escolhidos para comparar" aria-hidden={!on}>
      <ul>
        {itens.map((s) => (
          <li key={s}>{POR_SLUG.get(s)?.nome}<button type="button" tabIndex={on ? 0 : -1} aria-label={`Tirar ${POR_SLUG.get(s)?.nome}`} onClick={() => bandeja.remover(s)}>×</button></li>
        ))}
      </ul>
      <Link className="btn" tabIndex={on ? 0 : -1} href={urlComparacao(itens)}>{itens.length < 2 ? 'Escolher mais' : 'Comparar'}</Link>
    </aside>
  );
}
