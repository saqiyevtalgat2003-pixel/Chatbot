'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { updateProfileAction, type ProfileState } from '@/app/[locale]/dashboard/profile/actions';

const initialState: ProfileState = { error: null, success: false };

const LANGUAGES = [
  { value: 'kk', label: 'Қазақша' },
  { value: 'ru', label: 'Русский' },
  { value: 'uz', label: "O'zbekcha" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-card bg-gold text-ink font-display font-semibold text-sm px-5 py-3 hover:bg-gold-deep hover:text-white transition-colors disabled:opacity-60"
    >
      {pending ? '···' : label}
    </button>
  );
}

export default function ProfileForm({
  locale,
  email,
  fullName,
  preferredLanguage,
}: {
  locale: string;
  email: string;
  fullName: string;
  preferredLanguage: string;
}) {
  const t = useTranslations('Profile');
  const [state, formAction] = useFormState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink-soft">{t('emailLabel')}</label>
        <div className="rounded-card border border-ink-soft/10 bg-bg px-4 py-2.5 text-muted">
          {email}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-ink-soft">
          {t('fullNameLabel')}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={fullName}
          autoComplete="name"
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="preferredLanguage" className="text-sm font-medium text-ink-soft">
          {t('languageLabel')}
        </label>
        <select
          id="preferredLanguage"
          name="preferredLanguage"
          defaultValue={preferredLanguage}
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-azure"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger font-medium">
          {t(`error_${state.error}` as 'error_generic')}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-success font-medium">
          {t('saved')}
        </p>
      )}

      <SubmitButton label={t('saveAction')} />
    </form>
  );
}
