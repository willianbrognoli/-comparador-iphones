import type { MetadataRoute } from 'next';
import { IPHONES } from '@/data/iphones';
import { paresPopulares, parSlug } from '@/lib/comparar';
import { abs, SITE } from '@/lib/site';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const d = new Date(SITE.atualizado);
  return [
    { url: abs('/'), lastModified: d, changeFrequency: 'weekly', priority: 1 },
    { url: abs('/comparar/'), lastModified: d, changeFrequency: 'weekly', priority: 0.9 },
    ...IPHONES.map((p) => ({ url: abs(`/iphone/${p.slug}/`), lastModified: d, changeFrequency: 'monthly' as const, priority: p.ios.suportado ? 0.8 : 0.6 })),
    ...paresPopulares().map(([a, b]) => ({ url: abs(`/comparar/${parSlug(a, b)}/`), lastModified: d, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
