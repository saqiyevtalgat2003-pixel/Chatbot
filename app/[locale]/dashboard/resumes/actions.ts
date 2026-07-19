'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createEmptyResumeData } from '@/lib/resume/types';
import { getMaintenanceFlags } from '@/lib/settings';
import { getTemplateById, getTemplates, getDefaultTemplate } from '@/lib/templates';

const FREE_RESUME_LIMIT = 1;

/** Жаңа бос резюме жасап, конструктор бетіне бағыттайды. Free лимитті құрметтейді. */
export async function createResumeAction(locale: string, requestedTemplateId?: string) {
  // Defense in depth: if someone hits /dashboard/new directly while the
  // admin has the "new resume" maintenance toggle on, bounce them back
  // instead of letting the action run.
  const { newResume: newResumeMaintenance } = await getMaintenanceFlags();
  if (newResumeMaintenance) {
    redirect(`/${locale}/dashboard`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select('is_premium').eq('id', user.id).single(),
    supabase
      .from('resumes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  const isPremium = profile?.is_premium ?? false;
  if (!isPremium && (count ?? 0) >= FREE_RESUME_LIMIT) {
    redirect(`/${locale}/pricing`);
  }

  // Premium шаблон таңдалса да, оны тек premium пайдаланушыға ғана
  // қолдана аламыз — сервер жағында тексеру (defense in depth).
  const requestedTemplate = await getTemplateById(requestedTemplateId ?? null);
  const templateId =
    requestedTemplate && (isPremium || !requestedTemplate.isPremium)
      ? requestedTemplate.id
      : getDefaultTemplate(await getTemplates())?.id ?? null;

  const { data: resume, error } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      title: null,
      language: locale,
      template_id: templateId,
      data: createEmptyResumeData(),
    })
    .select('id')
    .single();

  if (error || !resume) {
    redirect(`/${locale}/dashboard`);
  }

  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard/resumes/${resume.id}`);
}

/**
 * Резюме конструкторында шаблонды ауыстыру — premium шаблонды тек premium
 * пайдаланушы таңдай алады, тіпті autosave жолымен емес, осы серверлік
 * әрекет арқылы (клиент жағын айналып өтуге болмайтындай).
 */
export async function setResumeTemplateAction(resumeId: string, templateId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'unauthorized' as const };
  }

  const [{ data: profile }, template] = await Promise.all([
    supabase.from('profiles').select('is_premium').eq('id', user.id).single(),
    getTemplateById(templateId),
  ]);

  if (!template) {
    return { error: 'not_found' as const };
  }

  const isPremium = profile?.is_premium ?? false;
  if (template.isPremium && !isPremium) {
    return { error: 'premium_required' as const };
  }

  const { error } = await supabase
    .from('resumes')
    .update({ template_id: template.id })
    .eq('id', resumeId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'update_failed' as const };
  }

  return { success: true as const };
}

export async function deleteResumeAction(locale: string, id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  await supabase.from('resumes').delete().eq('id', id).eq('user_id', user.id);
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard`);
}
