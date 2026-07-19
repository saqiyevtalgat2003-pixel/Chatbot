import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { normalizeResumeData } from '@/lib/resume/types';
import { getTemplateById } from '@/lib/templates';
import ResumePdfDocument from '@/lib/resume/pdf-document';

export async function GET(
  _request: Request,
  { params }: { params: { locale: string; id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: resume, error } = await supabase
    .from('resumes')
    .select('id, title, data, language, template_id, user_id')
    .eq('id', params.id)
    .single();

  if (error || !resume || resume.user_id !== user.id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const resumeData = normalizeResumeData(resume.data);
  const language = resume.language || params.locale;
  const template = await getTemplateById(resume.template_id);

  const buffer = await renderToBuffer(
    <ResumePdfDocument data={resumeData} language={language} templateSlug={template?.slug ?? 'modern'} />
  );

  const rawName = resume.title || resumeData.personal.fullName || 'resume';
  const asciiFileName = rawName.replace(/[^\x00-\x7F]/g, '').trim().replace(/\s+/g, '-') || 'resume';
  const utf8FileName = rawName.trim().replace(/\s+/g, '-') || 'resume';

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${asciiFileName}.pdf"; filename*=UTF-8''${encodeURIComponent(utf8FileName)}.pdf`,
    },
  });
}
