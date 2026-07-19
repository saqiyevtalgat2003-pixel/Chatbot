'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { ResumePersonal } from '@/lib/resume/types';

const inputClass =
  'rounded-card border border-ink-soft/15 bg-white px-4 py-2.5 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-azure text-sm';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

export default function PersonalSection({
  value,
  onChange,
}: {
  value: ResumePersonal;
  onChange: (value: ResumePersonal) => void;
}) {
  const t = useTranslations('ResumeEditor');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function set<K extends keyof ResumePersonal>(key: K, val: ResumePersonal[K]) {
    onChange({ ...value, [key]: val });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError(t('photoErrorType'));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setUploadError(t('photoErrorSize'));
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploading(false);
      setUploadError(t('photoErrorGeneric'));
      return;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('resume-photos')
      .upload(path, file, { contentType: file.type, upsert: true });

    if (uploadErr) {
      setUploading(false);
      setUploadError(t('photoErrorGeneric'));
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('resume-photos')
      .getPublicUrl(path);

    setUploading(false);
    set('photoUrl', publicUrlData.publicUrl);
  }

  function removePhoto() {
    set('photoUrl', '');
    setUploadError(null);
  }

  return (
    <section className="rounded-card border border-ink-soft/10 bg-white p-5">
      <h2 className="font-display font-semibold text-ink mb-4">{t('personalTitle')}</h2>

      {/* Фото */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-full bg-bg border border-ink-soft/15 overflow-hidden shrink-0 flex items-center justify-center">
          {value.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-muted" aria-hidden="true">
              🙂
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-full bg-azure/10 text-azure-deep text-sm font-medium px-4 py-1.5 hover:bg-azure/20 transition-colors disabled:opacity-60"
            >
              {uploading ? t('photoUploading') : t('photoUpload')}
            </button>
            {value.photoUrl && !uploading && (
              <button
                type="button"
                onClick={removePhoto}
                className="text-sm font-medium text-muted hover:text-danger transition-colors"
              >
                {t('photoRemove')}
              </button>
            )}
          </div>
          {uploadError ? (
            <p className="text-xs text-danger">{uploadError}</p>
          ) : (
            <p className="text-xs text-muted">{t('photoHint')}</p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label={t('fullName')}>
          <input
            className={inputClass}
            value={value.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            placeholder={t('fullNamePlaceholder')}
          />
        </Field>
        <Field label={t('jobTitle')}>
          <input
            className={inputClass}
            value={value.jobTitle}
            onChange={(e) => set('jobTitle', e.target.value)}
            placeholder={t('jobTitlePlaceholder')}
          />
        </Field>
        <Field label={t('email')}>
          <input
            type="email"
            className={inputClass}
            value={value.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>
        <Field label={t('phone')}>
          <input
            type="tel"
            className={inputClass}
            value={value.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+7 7__ ___ __ __"
          />
        </Field>
        <Field label={t('city')} className="sm:col-span-2">
          <input
            className={inputClass}
            value={value.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </Field>
        <Field label={t('summary')} className="sm:col-span-2">
          <textarea
            className={`${inputClass} min-h-[96px] resize-y`}
            value={value.summary}
            onChange={(e) => set('summary', e.target.value)}
            placeholder={t('summaryPlaceholder')}
          />
        </Field>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
