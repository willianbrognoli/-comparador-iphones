'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Seletor from './Seletor';
import { urlComparacao } from '@/lib/rotas';

export default function HeroInicio({ inicial }: { inicial: string[] }) {
  const [v, setV] = useState(inicial);
  const router = useRouter();
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (v.length) router.push(urlComparacao(v)); }} aria-label="Escolher iPhones para comparar">
      <Seletor valores={v} aoMudar={setV} botao={<button className="btn btn-azul" type="submit" disabled={v.length < 2}>Comparar</button>} />
    </form>
  );
}
