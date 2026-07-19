'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { loginAction, signupAction, type AuthState } from '@/app/[locale]/(auth)/actions';

const initialState: AuthState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-card bg-gold text-ink font-display font-semibold text-sm px-5 py-3 hover:bg-gold-deep hover:text-white transition-colors disabled:opacity-60"
    >
      {pending ? '···' : label}
    </button>
  );
}

export default function AuthForm({
  mode,
  locale,
}: {
  mode: 'login' | 'signup';
  locale: string;
}) {
  const t = useTranslations('Auth');
  const action = mode === 'login' ? loginAction : signupAction;
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      {mode === 'signup' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-sm font-medium text-ink-soft">
            {t('fullName')}
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-soft">
          {t('email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-soft">
          {t('password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger font-medium">
          {state.error === 'weakPassword'
            ? t('errorWeakPassword')
            : state.error === 'tooManyAttempts'
              ? t('errorTooManyAttempts')
              : state.error === 'maintenance'
                ? t('maintenanceDesc')
                : t('errorGeneric')}
        </p>
      )}

      <SubmitButton label={mode === 'login' ? t('loginButton') : t('signupButton')} />
    </form>
  );
}
