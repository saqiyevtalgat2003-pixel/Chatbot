'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/dashboard/actions';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/dashboard/payments', icon: '💰', label: 'Күтудегі төлемдер' },
  { href: '/dashboard/users', icon: '👥', label: 'Пайдаланушылар' },
  { href: '/dashboard/templates', icon: '🎨', label: 'Шаблондар' },
  { href: '/dashboard/support', icon: '💬', label: 'Қолдау тікеттері' },
  { href: '/dashboard/resumes', icon: '📋', label: 'Барлық резюмелер' },
  { href: '/dashboard/audit-log', icon: '📜', label: 'Audit log' },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Баптаулар' },
];

export default function Sidebar({ fullName, email }: { fullName: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-ink-soft/10 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-ink-soft/10">
        <p className="font-bold text-ink">KZ Resume</p>
        <p className="text-xs text-muted">Admin панель</p>
      </div>

      <nav className="flex-1 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-azure/10 text-azure-deep font-semibold border-r-2 border-azure'
                  : 'text-ink-soft hover:bg-bg'
              }`}
            >
              <span aria-hidden="true">{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-ink-soft/10">
        <p className="text-sm font-medium text-ink truncate">{fullName || email}</p>
        <p className="text-xs text-muted truncate mb-3">{email}</p>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-danger hover:underline">
            🚪 Шығу
          </button>
        </form>
      </div>
    </aside>
  );
}
