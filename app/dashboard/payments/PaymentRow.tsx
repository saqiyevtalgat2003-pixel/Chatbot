'use client';

import { useState, useTransition } from 'react';
import { reviewPaymentAction } from './actions';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Күтуде',
  approved: 'Расталды',
  rejected: 'Бас тартылды',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-gold-deep',
  approved: 'text-success',
  rejected: 'text-danger',
};

export default function PaymentRow({ payment }: { payment: any }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(payment.status);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleDecision(decision: 'approved' | 'rejected') {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await reviewPaymentAction(payment.id, decision);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setStatus(decision);
      }
    });
  }

  return (
    <div className="rounded-card border border-ink-soft/10 bg-white px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-semibold text-ink truncate">
          {payment.profiles?.full_name || payment.profiles?.email || payment.user_id}
        </p>
        <p className="text-xs text-muted truncate">
          {payment.type} · {payment.amount} ₸ ·{' '}
          {new Date(payment.created_at).toLocaleString('kk-KZ')}
        </p>
        {payment.receipt_url && (
          <a
            href={payment.receipt_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-azure hover:underline"
          >
            Түбіртекті қарау
          </a>
        )}
        {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-sm font-medium ${STATUS_COLOR[status] || 'text-muted'}`}>
          {STATUS_LABEL[status] || status}
        </span>
        {status === 'pending' && (
          <>
            <button
              disabled={isPending}
              onClick={() => handleDecision('approved')}
              className="text-sm px-3 py-1.5 rounded-md bg-success text-white disabled:opacity-50"
            >
              Растау
            </button>
            <button
              disabled={isPending}
              onClick={() => handleDecision('rejected')}
              className="text-sm px-3 py-1.5 rounded-md bg-danger text-white disabled:opacity-50"
            >
              Бас тарту
            </button>
          </>
        )}
      </div>
    </div>
  );
}
