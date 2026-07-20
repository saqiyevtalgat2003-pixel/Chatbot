'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from './actions';

const initialState: LoginState = { error: null };

const ERROR_MESSAGES: Record<string, string> = {
  fieldsRequired: 'Email мен парольді толтыр',
  invalidCredentials: 'Email немесе пароль қате',
  notAdmin: 'Бұл аккаунтта әкімші құқығы жоқ',
  tooManyAttempts: 'Тым көп әрекет жасалды. 15 минуттан кейін қайта көріңіз.',
  serverError: 'Сервер қатесі. Қайта көріңіз.',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-card bg-ink text-white font-semibold text-sm px-5 py-3 hover:bg-ink-soft transition-colors disabled:opacity-60"
    >
      {pending ? '···' : 'Кіру'}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-soft">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-azure"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink-soft">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-azure"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger font-medium">
          {ERROR_MESSAGES[state.error] ?? 'Қате шықты, қайта көріңіз'}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
