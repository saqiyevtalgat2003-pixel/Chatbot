'use client';

import { useState, useTransition } from 'react';
import { toggleTemplatePremiumAction } from './actions';

export default function TemplateCard({ template }: { template: any }) {
  const [isPending, startTransition] = useTransition();
  const [isPremium, setIsPremium] = useState<boolean>(template.is_premium);

  function handleToggle() {
    const next = !isPremium;
    startTransition(async () => {
      const res = await toggleTemplatePremiumAction(template.id, next);
      if (!res?.error) setIsPremium(next);
    });
  }

  return (
    <div className="rounded-card border border-ink-soft/10 bg-white overflow-hidden">
      <div className="aspect-[3/4] bg-bg flex items-center justify-center">
        {template.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted text-xs">Алдын ала қарау жоқ</span>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-ink text-sm truncate">{template.name}</p>
        <button
          disabled={isPending}
          onClick={handleToggle}
          className={`mt-2 text-xs px-3 py-1.5 rounded-md font-medium disabled:opacity-50 ${
            isPremium ? 'bg-gold text-white' : 'bg-bg text-muted'
          }`}
        >
          {isPremium ? 'Premium' : 'Тегін'}
        </button>
      </div>
    </div>
  );
}
