import { createClient } from '@/lib/supabase/server';

export type TemplateSlug = 'classic' | 'modern' | 'executive' | 'creative';

export type ResumeTemplate = {
  id: string;
  name: string;
  slug: TemplateSlug;
  isPremium: boolean;
};

const KNOWN_SLUGS: TemplateSlug[] = ['classic', 'modern', 'executive', 'creative'];

function toSlug(config: unknown): TemplateSlug {
  const slug = (config as { slug?: string } | null)?.slug;
  return KNOWN_SLUGS.includes(slug as TemplateSlug) ? (slug as TemplateSlug) : 'modern';
}

/**
 * Барлық шаблондарды (admin панелден басқарылатын is_premium жалауымен
 * бірге) оқиды. RLS-те публикалық SELECT policy бар, сондықтан бұл
 * функция логин-сіз беттерде де (басты бет) шақырыла алады.
 */
export async function getTemplates(): Promise<ResumeTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, config, is_premium')
    .order('name');

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name ?? '',
    slug: toSlug(row.config),
    isPremium: row.is_premium ?? false,
  }));
}

export async function getTemplateById(id: string | null): Promise<ResumeTemplate | null> {
  if (!id) return null;
  const templates = await getTemplates();
  return templates.find((t) => t.id === id) ?? null;
}

/** Free/жаңа резюмеге әдепкі шаблон — премиум емес, ең біріншісі. */
export function getDefaultTemplate(templates: ResumeTemplate[]): ResumeTemplate | null {
  return templates.find((t) => t.slug === 'modern' && !t.isPremium) ?? templates.find((t) => !t.isPremium) ?? templates[0] ?? null;
}
