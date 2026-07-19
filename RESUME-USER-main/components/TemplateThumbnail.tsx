import type { TemplateSlug } from '@/lib/templates';

/**
 * Шаблонның CSS-пен салынған кіші алдын ала қарауы — нақты кескін
 * файлдарын сақтамай-ақ, әр шаблонның layout стилін көрсетеді.
 */
export default function TemplateThumbnail({ slug }: { slug: TemplateSlug }) {
  if (slug === 'classic') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white">
        <div className="h-2 w-1/2 bg-ink/70 rounded" />
        <div className="h-1 w-1/3 bg-ink/30 rounded mb-2" />
        <div className="h-px w-3/4 bg-ink/15 my-1" />
        <div className="h-1 w-full bg-ink/10 rounded" />
        <div className="h-1 w-5/6 bg-ink/10 rounded" />
        <div className="h-1 w-4/6 bg-ink/10 rounded" />
      </div>
    );
  }

  if (slug === 'executive') {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="h-1/3 bg-ink flex flex-col items-start justify-center gap-1.5 px-4 border-b-2 border-gold">
          <div className="h-1.5 w-2/3 bg-gold rounded" />
          <div className="h-1 w-1/2 bg-white/40 rounded" />
        </div>
        <div className="flex-1 flex">
          <div className="flex-1 p-3 space-y-1.5">
            <div className="h-1 w-full bg-ink/15 rounded" />
            <div className="h-1 w-5/6 bg-ink/15 rounded" />
            <div className="h-1 w-4/6 bg-ink/15 rounded" />
          </div>
          <div className="w-1/3 bg-bg p-2 space-y-1.5 border-l border-ink-soft/10">
            <div className="h-1 w-full bg-gold-deep/40 rounded" />
            <div className="h-1 w-2/3 bg-gold-deep/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'creative') {
    return (
      <div className="w-full h-full flex flex-col gap-2 p-4 bg-white">
        <div className="h-8 rounded bg-gradient-to-br from-azure via-azure-deep to-ink shrink-0" />
        <div className="flex gap-1 flex-wrap">
          <span className="h-2.5 w-8 rounded-full bg-azure/20" />
          <span className="h-2.5 w-6 rounded-full bg-gold/30" />
          <span className="h-2.5 w-10 rounded-full bg-azure/20" />
        </div>
        <div className="flex-1 flex flex-col gap-1.5 pl-2 border-l-2 border-dashed border-ink-soft/20">
          <div className="h-1 w-full bg-ink/15 rounded" />
          <div className="h-1 w-4/6 bg-ink/15 rounded" />
        </div>
      </div>
    );
  }

  // modern (default)
  return (
    <div className="w-full h-full flex bg-white">
      <div className="w-1/3 bg-ink flex flex-col items-center gap-1.5 p-2.5">
        <div className="h-4 w-4 rounded-full bg-gold/70" />
        <div className="h-1 w-full bg-white/30 rounded" />
        <div className="h-1 w-2/3 bg-white/30 rounded" />
      </div>
      <div className="flex-1 p-2.5 space-y-1.5">
        <div className="h-1.5 w-3/4 bg-ink/60 rounded" />
        <div className="h-1 w-1/2 bg-azure/60 rounded mb-1.5" />
        <div className="h-1 w-full bg-ink/10 rounded" />
        <div className="h-1 w-5/6 bg-ink/10 rounded" />
      </div>
    </div>
  );
}
