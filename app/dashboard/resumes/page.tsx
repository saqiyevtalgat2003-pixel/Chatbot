import { requireAdmin } from '@/lib/supabase/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import ResumeRow from './ResumeRow';

export default async function ResumesPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: resumes, error } = await supabase
    .from('resumes')
    .select(
      'id, title, language, created_at, updated_at, profiles:user_id(email, full_name), templates:template_id(name)'
    )
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-bold text-2xl text-ink mb-1">Барлық резюмелер</h1>
      <p className="text-sm text-muted mb-8">Жүйедегі барлық резюмелер тізімі</p>

      {error && <p className="text-danger text-sm mb-4">Қате: {error.message}</p>}

      <div className="rounded-card border border-ink-soft/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg text-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Тақырып</th>
              <th className="px-4 py-3 font-medium">Иесі</th>
              <th className="px-4 py-3 font-medium">Шаблон</th>
              <th className="px-4 py-3 font-medium">Тіл</th>
              <th className="px-4 py-3 font-medium">Жаңартылған</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {resumes?.map((r: any) => (
              <ResumeRow key={r.id} resume={r} />
            ))}
          </tbody>
        </table>
        {!error && (!resumes || resumes.length === 0) && (
          <p className="text-muted text-sm px-4 py-6">Резюмелер табылмады.</p>
        )}
      </div>
    </div>
  );
}
