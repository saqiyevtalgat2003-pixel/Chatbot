import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeResumeData } from '@/lib/resume/types';
import { getTemplates } from '@/lib/templates';
import ResumeEditor from '@/components/resume-editor/ResumeEditor';

export default async function ResumeEditPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  setRequestLocale(locale);

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: resume, error }, { data: profile }, templates] = await Promise.all([
    supabase
      .from('resumes')
      .select('id, title, data, template_id, updated_at, user_id')
      .eq('id', id)
      .single(),
    supabase.from('profiles').select('is_premium').eq('id', user.id).single(),
    getTemplates(),
  ]);

  if (error || !resume || resume.user_id !== user.id) {
    notFound();
  }

  return (
    <ResumeEditor
      locale={locale}
      resumeId={resume.id}
      initialTitle={resume.title ?? ''}
      initialData={normalizeResumeData(resume.data)}
      initialTemplateId={resume.template_id}
      templates={templates}
      isPremium={profile?.is_premium ?? false}
    />
  );
}
