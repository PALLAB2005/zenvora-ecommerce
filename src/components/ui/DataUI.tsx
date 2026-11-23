import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-[#EFEFED] rounded-lg', className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 border border-[#E5E5E5] rounded-2xl bg-[#F8F8F7]">
      {icon && <div className="mb-3 text-[#737373]">{icon}</div>}
      <h3 className="text-base font-semibold text-[#171717]">{title}</h3>
      <p className="mt-1.5 text-sm text-[#737373] max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-9 w-9 rounded-lg text-xs font-semibold tabular-nums transition-colors cursor-pointer',
              p === page
                ? 'bg-[#171717] text-white'
                : 'text-[#737373] hover:bg-[#F8F8F7] hover:text-[#171717]'
            )}
          >
            {p}
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  className,
}: {
  tabs: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-1 p-1 bg-[#F8F8F7] border border-[#E5E5E5] rounded-xl', className)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={tab.id === activeId}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer',
            tab.id === activeId
              ? 'bg-white text-[#171717] shadow-sm'
              : 'text-[#737373] hover:text-[#171717]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
