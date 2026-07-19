import { createResumeAction } from '../resumes/actions';

export default async function NewResumePage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { template?: string };
}) {
  await createResumeAction(locale, searchParams?.template);
  return null;
}
