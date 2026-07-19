'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { submitReceiptAction, type PaymentState } from '@/app/[locale]/pricing/actions';

const initialState: PaymentState = { error: null, success: false };

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

export default function ReceiptUploadForm({ locale }: { locale: string }) {
  const t = useTranslations('PricingPage');
  const [state, formAction] = useFormState(submitReceiptAction, initialState);

  if (state.success) {
    return (
      <p role="status" className="text-sm text-success font-medium">
        {t('uploadSuccess')}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="receipt" className="text-sm font-medium text-ink-soft">
          {t('receiptLabel')}
        </label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          accept="image/*"
          required
          className="rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-azure/10 file:text-azure-deep file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger font-medium">
          {t(`error_${state.error}` as 'error_generic')}
        </p>
      )}

      <SubmitButton label={t('uploadAction')} />
    </form>
  );
}
