import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ComparadorLivre } from '@/components/Comparacao';
import { abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Comparar iPhones lado a lado',
  description: 'Escolha até três iPhones e compare ficha técnica, câmeras, bateria, tamanho real em 3D e suporte ao iOS.',
  alternates: { canonical: abs('/comparar/') },
};

export default function Comparar() {
  return (
    <div className="wrap" style={{ paddingBottom: 60 }}>
      <section className="comp-hero">
        <h1>Comparar iPhones</h1>
        <p className="lead" style={{ margin: '0 0 20px' }}>Escolha até três modelos. A URL muda junto, então dá para mandar a comparação para alguém.</p>
      </section>
      <Suspense fallback={<p className="mudo">Carregando o comparador…</p>}>
        <ComparadorLivre />
      </Suspense>
    </div>
  );
}
