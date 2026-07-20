'use client';

import { useState, useTransition } from 'react';
import { replyTicketAction } from './actions';

const STATUS_LABEL: Record<string, string> = {
  open: 'Ашық',
  closed: 'Жабық',
};

export default function TicketCard({ ticket }: { ticket: any }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(ticket.status);
  const [reply, setReply] = useState<string>(ticket.admin_reply || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleReply() {
    if (!reply.trim()) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await replyTicketAction(ticket.id, reply.trim());
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setStatus('closed');
      }
    });
  }

  return (
    <div className="rounded-card border border-ink-soft/10 bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{ticket.subject}</p>
          <p className="text-xs text-muted truncate">
            {ticket.profiles?.full_name || ticket.profiles?.email} ·{' '}
            {new Date(ticket.created_at).toLocaleString('kk-KZ')}
          </p>
        </div>
        <span className={`text-xs font-medium shrink-0 ${status === 'open' ? 'text-gold-deep' : 'text-success'}`}>
          {STATUS_LABEL[status] || status}
        </span>
      </div>

      <p className="text-sm text-ink-soft mb-3 whitespace-pre-wrap">{ticket.message}</p>

      {status === 'open' ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Жауап жазу..."
            rows={2}
            className="w-full text-sm rounded-md border border-ink-soft/20 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-azure"
          />
          {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
          <button
            disabled={isPending || !reply.trim()}
            onClick={handleReply}
            className="self-start text-sm px-3 py-1.5 rounded-md bg-azure text-white disabled:opacity-50"
          >
            Жауап беру және жабу
          </button>
        </div>
      ) : (
        ticket.admin_reply && (
          <div className="text-sm bg-bg rounded-md px-3 py-2">
            <p className="text-xs text-muted mb-1">Admin жауабы:</p>
            <p className="text-ink-soft whitespace-pre-wrap">{ticket.admin_reply}</p>
          </div>
        )
      )}
    </div>
  );
}
