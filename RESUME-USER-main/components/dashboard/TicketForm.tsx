'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { createTicketAction, type TicketState } from '@/app/[locale]/dashboard/support/actions';

const initialState: TicketState = { error: null, success: false };

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

export default function TicketForm({
  locale,
  hasOpenTicket,
}: {
  locale: string;
  hasOpenTicket: boolean;
}) {
  const t = useTranslations('Support');
  const [state, formAction] = useFormState(createTicketAction, initialState);

  // Ашық тікет болса форманы жасырып, хабарлама көрсету
  if (hasOpenTicket) {
    return (
      <div className="rounded-card border border-gold/30 bg-gold/5 px-5 py-4">
        <p className="text-sm font-medium text-gold-deep">⏳ {t('hasOpenTicket')}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-ink-soft">
          {t('subjectLabel')}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-ink-soft">
          {t('messageLabel')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure resize-none"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger font-medium">
          {t(`error_${state.error}` as 'error_generic')}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-success font-medium">
          {t('sentSuccess')}
        </p>
      )}

      <SubmitButton label={t('sendAction')} />
    </form>
  );
}
