import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../lib/cn';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  children,
  footer,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'relative z-10 flex flex-col w-full max-w-md bg-white h-full shadow-2xl border-[#E5E5E5]',
          side === 'right' ? 'ml-auto border-l' : 'mr-auto border-r'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
          <h2 className="text-base font-semibold text-[#171717]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F8F8F7] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[#E5E5E5] bg-[#F8F8F7]">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
