# Versus · Comparador de iPhones

Comparador de **todos os iPhones já lançados**, do iPhone original (2007) ao iPhone 18 Pro, 18 Pro Max e iPhone Duo (2026). Feito em **Next.js** com exportação estática, **visualização 3D em Three.js** gerada por código e foco em SEO.

## O que tem

- **55 modelos** com ficha técnica completa: tela, chip, RAM, armazenamento, câmeras, vídeo, bateria, recarga, dimensões, peso, materiais, resistência à água, conectividade, biometria, botões e suporte ao iOS.
- **Comparador de até 3 iPhones**, com o melhor valor de cada linha marcado e a opção "mostrar só o que é diferente". A URL muda junto (`/comparar/?m=iphone-15,iphone-16`), então dá para compartilhar.
- **353 comparações com página própria** (ex.: `/comparar/iphone-17-pro-vs-iphone-18-pro/`). Cada uma traz um resumo do que muda, um veredito e perguntas frequentes.
- **Página de cada modelo** (`/iphone/iphone-15-pro/`) com 3D nas cores de lançamento, notas por categoria, preço e sugestões de comparação.
- **3D leve e em escala real.** Os aparelhos são desenhados por código a partir das medidas reais: cantos, módulo de câmera de cada geração, Dynamic Island, notch, botão Início e botões laterais. Não há arquivos `.glb` nem arte da Apple. Colocando dois modelos lado a lado, a diferença de tamanho aparece de verdade.
- **Notas de 0 a 10** (desempenho, câmeras, tela, bateria), calculadas em relação a todos os iPhones da base.
- **Bandeja de comparação:** o botão "+" nos cards junta modelos de qualquer página (fica salvo no navegador).

## Desempenho

- O Three.js só é baixado quando o visualizador entra na tela (`IntersectionObserver` + `import()` dinâmico).
- A cena só renderiza quando algo muda e pausa quando sai da tela ou a aba fica oculta.
- O `devicePixelRatio` é limitado a 1,75.
- Antes de carregar, e em aparelhos sem WebGL, aparece uma silhueta em SVG. É isso que buscadores e leitores de tela recebem.
- Quem ativa "reduzir movimento" no sistema não vê animações nem giro automático.

## SEO

- Todas as páginas são HTML estático, com o conteúdo completo já no HTML.
- `title`, `description`, URL canônica e Open Graph em todas as páginas.
- Dados estruturados (JSON-LD): `WebSite`, `ItemList`, `Product` e `BreadcrumbList` nas páginas de modelo, `FAQPage` e `BreadcrumbList` nas comparações.
- `sitemap.xml` e `robots.txt` são gerados no build.
- Tabelas semânticas (`<table>` com `th scope`), `lang="pt-BR"` e links internos entre modelos e comparações.
- Enquanto um preço for ilustrativo, ele **não entra** no JSON-LD (`offers`).

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # gera o site estático em ./out
npm start            # serve a pasta ./out
```

Requer Node 20 ou mais novo (`.nvmrc` = 22).

## Publicar no GitHub Pages

1. Suba o projeto para um repositório no GitHub (branch `main`).
2. No repositório, vá em **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. A cada push na `main`, o workflow `.github/workflows/deploy.yml` gera e publica o site em `https://<usuario>.github.io/<repositorio>/`.

**Domínio próprio:** no workflow, troque as variáveis por `NEXT_PUBLIC_BASE_PATH: ''` e `NEXT_PUBLIC_SITE_URL: https://seudominio.com.br`, e configure o domínio em Settings → Pages.

**Vercel ou Netlify:** funciona sem mudanças. Basta definir `NEXT_PUBLIC_SITE_URL` com o domínio final.

## Preços

Todos os preços estão como **valor ilustrativo** (aparecem com o selo e um asterisco na tabela). Para colocar o preço real, edite `src/data/iphones.ts` e adicione `preco` ao modelo:

```ts
{
  slug: 'iphone-18-pro', nome: 'iPhone 18 Pro', ...
  preco: 11999, // preço de lançamento no Brasil em R$ (remove o selo "ilustrativo")
}
```

Com o preço real, o modelo passa a disputar "melhor preço" na tabela e ganha `offers` no JSON-LD.

## Adicionar um iPhone novo

Copie um item de `src/data/iphones.ts`, ajuste os campos e escolha o `layoutCamera` mais parecido (`canto`, `canto-flash`, `dupla-h`, `dupla-v`, `quadrado-2v`, `quadrado-2d`, `quadrado-3`, `capsula-v`, `barra`, `plato`, `capsula-h`). As páginas do modelo, as comparações, o sitemap e as notas são gerados automaticamente.

## Fontes e observações sobre os dados

- Fichas técnicas oficiais da Apple (páginas de especificações e comparação de modelos).
- A Apple **não divulga a RAM nem a capacidade da bateria em mAh**. Esses valores vêm de registros oficiais e da imprensa especializada, e o site avisa isso na tabela. Quando não há dado confiável, aparece "Não divulgada".
- O "índice de desempenho" é um **valor relativo estimado**, para comparar gerações, e não um resultado oficial de benchmark.
- Os dados foram atualizados em 06/10/2026 (`SITE.atualizado`, em `src/lib/site.ts`).

## Estrutura

```
src/
  data/        tipos e base de dados dos iPhones
  lib/         regras de comparação, notas, textos, rotas, geração 3D (Three.js)
  components/  visualizador 3D, seletor, tabela, grade, bandeja…
  app/         páginas (Next.js App Router), sitemap e robots
```

Projeto independente, sem vínculo com a Apple Inc. iPhone é marca registrada da Apple Inc.

Licença MIT.
