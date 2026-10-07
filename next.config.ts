import type { NextConfig } from 'next';

// Exportação 100% estática (funciona no GitHub Pages, Vercel, Netlify ou qualquer hospedagem).
// Para GitHub Pages em https://usuario.github.io/repositorio, defina NEXT_PUBLIC_BASE_PATH=/repositorio.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default config;
