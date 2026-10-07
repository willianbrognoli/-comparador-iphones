import Link from 'next/link';
export default function NaoEncontrado() {
  return (
    <section className="secao"><div className="wrap">
      <h1 className="h2">Página não encontrada</h1>
      <p className="mudo">O endereço pode ter mudado. Volte para a lista de modelos ou monte uma comparação.</p>
      <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link className="btn" href="/">Ver todos os iPhones</Link><Link className="btn btn-claro" href="/comparar/">Comparar</Link></p>
    </div></section>
  );
}
