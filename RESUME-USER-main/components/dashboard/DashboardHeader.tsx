'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageDropdown from '@/components/LanguageDropdown';
import { logoutAction } from '@/app/[locale]/(auth)/actions';

export default function DashboardHeader({
  locale,
  fullName,
  email,
  isPremium,
  newResumeMaintenanceEnabled = false,
}: {
  locale: string;
  fullName: string;
  email: string;
  isPremium: boolean;
  newResumeMaintenanceEnabled?: boolean;
}) {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initial = (fullName || email || '?').trim().charAt(0).toUpperCase();

  function close() {
    setOpen(false);
  }

  function openMenu() {
    setOpen(true);
    // Мәзір ашылғанда барлық беттерді фонда жүктеп қою
    router.prefetch(`/${locale}/dashboard`);
    router.prefetch(`/${locale}/dashboard/resumes`);
    router.prefetch(`/${locale}/dashboard/templates`);
    router.prefetch(`/${locale}/pricing`);
    router.prefetch(`/${locale}/dashboard/profile`);
    router.prefetch(`/${locale}/dashboard/support`);
  }

  function handleLogout() {
    startTransition(() => {
      logoutAction(locale);
    });
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-sm border-b border-ink-soft/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/${locale}/dashboard`} className="font-display font-bold text-xl text-ink">
            KZ Resume
          </Link>
          <div className="flex items-center gap-4">
            <LanguageDropdown />
            <div
              aria-hidden="true"
              className="h-9 w-9 rounded-full bg-azure/15 text-azure-deep font-display font-semibold flex items-center justify-center text-sm"
            >
              {initial}
            </div>
            <button
              type="button"
              onClick={openMenu}
              aria-label={t('menuAriaLabel')}
              aria-expanded={open}
              className="text-2xl leading-none text-ink hover:text-azure transition-colors"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity motion-reduce:transition-none ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed top-0 right-0 z-50 h-full w-[320px] max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 motion-reduce:transition-none flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-6 py-6 border-b border-ink-soft/10 flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-full bg-azure/15 text-azure-deep font-display font-semibold flex items-center justify-center text-lg">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-ink truncate">{fullName || email}</p>
            <span
              className={`inline-block mt-1 text-xs font-mono px-2 py-0.5 rounded-full ${
                isPremium ? 'bg-gold/20 text-gold-deep' : 'bg-ink-soft/10 text-muted'
              }`}
            >
              {isPremium ? 'Premium' : t('freeTariffTag')}
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t('closeMenuAriaLabel')}
            className="ml-auto text-xl text-muted hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <DrawerLink href={`/${locale}/dashboard`} onClick={close}>
            <span>🏠</span> {t('menuHome')}
          </DrawerLink>
          {newResumeMaintenanceEnabled ? (
            <div className="flex items-center gap-3 px-6 py-3 text-[15px] text-ink-soft/50 cursor-not-allowed">
              <span>➕</span> {t('menuNewResume')}
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono font-semibold text-gold-deep bg-gold/15 px-1.5 py-0.5 rounded">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-gold-deep animate-pulse motion-reduce:animate-none"
                />
                {t('newResumeMaintenanceBadge')}
              </span>
            </div>
          ) : (
            <DrawerLink href={`/${locale}/dashboard/new`} onClick={close}>
              <span>➕</span> {t('menuNewResume')}
            </DrawerLink>
          )}
          <DrawerLink href={`/${locale}/dashboard/resumes`} onClick={close}>
            <span>📄</span> {t('menuMyResumes')}
          </DrawerLink>
          <DrawerLink href={`/${locale}/dashboard/templates`} onClick={close}>
            <span>🎨</span> {t('menuTemplates')}
          </DrawerLink>
          <DrawerLink href={`/${locale}/pricing`} onClick={close}>
            <span>💳</span> {t('menuPricing')}
            {!isPremium && (
              <span className="ml-2 text-[10px] font-mono font-semibold text-gold-deep bg-gold/15 px-1.5 py-0.5 rounded">
                {t('menuProBadge')}
              </span>
            )}
          </DrawerLink>
          <DrawerLink href={`/${locale}/dashboard/profile`} onClick={close}>
            <span>👤</span> {t('menuProfile')}
          </DrawerLink>

          <div className="flex items-center justify-between px-6 py-3 text-ink-soft text-[15px]">
            <span className="flex items-center gap-3">
              <span>🌐</span> {t('menuLanguage')}
            </span>
            <LanguageDropdown />
          </div>

          <DrawerLink href={`/${locale}/dashboard/support`} onClick={close}>
            <span>💬</span> {t('menuSupport')}
          </DrawerLink>
        </nav>

        <div className="border-t border-ink-soft/10 px-6 py-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-3 text-danger font-medium text-sm hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            <span>🚪</span> {isPending ? '···' : t('menuLogout')}
          </button>
        </div>
      </aside>
    </>
  );
}

function DrawerLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-6 py-3 text-[15px] text-ink-soft hover:bg-bg hover:text-ink transition-colors"
    >
      {children}
    </Link>
  );
}
