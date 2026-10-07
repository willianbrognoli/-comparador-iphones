import Link from 'next/link';
import { IPHONES } from '@/data/iphones';
import { SITE } from '@/lib/site';
import { fmtData } from '@/lib/comparar';

export default function Rodape() {
  const recentes = IPHONES.slice(-6).reverse();
  return (
    <footer className="rodape">
      <div className="wrap grid">
        <div>
          <h4>{SITE.nome}, {SITE.slogan.toLowerCase()}</h4>
          <p style={{ margin: 0, maxWidth: '46ch' }}>
            Especificações reunidas das fichas técnicas da Apple. Capacidade da bateria em mAh e memória RAM não são divulgadas pela Apple e vêm de registros oficiais e da imprensa especializada.
            Projeto independente, sem vínculo com a Apple Inc. iPhone é marca registrada da Apple Inc.
          </p>
          <p style={{ marginTop: 10 }}>Dados atualizados em {fmtData(SITE.atualizado)}.</p>
        </div>
        <div>
          <h4>Lançamentos recentes</h4>
          <ul>{recentes.map((p) => <li key={p.slug}><Link href={`/iphone/${p.slug}/`}>{p.nome}</Link></li>)}</ul>
        </div>
        <div>
          <h4>Navegar</h4>
          <ul>
            <li><Link href="/comparar/">Comparar iPhones</Link></li>
            <li><Link href="/#todos">Todos os modelos</Link></li>
            <li><Link href="/#populares">Comparações populares</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
