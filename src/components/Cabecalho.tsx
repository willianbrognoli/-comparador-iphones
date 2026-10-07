import Link from 'next/link';
import Marca from './Marca';
import { SITE } from '@/lib/site';

export default function Cabecalho() {
  return (
    <header className="topo">
      <div className="wrap">
        <Link href="/" className="marca" aria-label={`${SITE.nome}, início`}>
          <Marca />
          {SITE.nome}
          <small>{SITE.slogan}</small>
        </Link>
        <nav className="menu" aria-label="Principal">
          <Link href="/comparar/">Comparar</Link>
          <Link href="/#todos"><span className="longo">Todos os iPhones</span><span className="curto">Modelos</span></Link>
        </nav>
      </div>
    </header>
  );
}
