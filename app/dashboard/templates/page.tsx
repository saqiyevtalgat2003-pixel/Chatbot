import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import TemplateCard from './TemplateCard';

export default async function TemplatesPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: templates, error } = await supabase
    .from('templates')
    .select('id, name, thumbnail_url, is_premium')
    .order('name');

  return (
    <div>
      <h1 className="font-bold text-2xl text-ink mb-1">Шаблондар</h1>
      <p className="text-sm text-muted mb-8">Резюме шаблондарын басқару</p>

      {error && <p className="text-danger text-sm mb-4">Қате: {error.message}</p>}

      {!error && (!templates || templates.length === 0) && (
        <p className="text-muted text-sm">Әзірге шаблон қосылмаған.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {templates?.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
}
