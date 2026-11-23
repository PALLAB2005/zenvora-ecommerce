import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useToastStore } from '../../store/useToastStore';

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => {
        const Icon =
          t.variant === 'success'
            ? CheckCircle2
            : t.variant === 'error'
            ? XCircle
            : t.variant === 'warning'
            ? AlertTriangle
            : Info;
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white border shadow-lg',
              t.variant === 'error'
                ? 'border-[#FECACA]'
                : t.variant === 'success'
                ? 'border-[#BBF7D0]'
                : 'border-[#E5E5E5]'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 mt-0.5 shrink-0',
                t.variant === 'success'
                  ? 'text-[#16A34A]'
                  : t.variant === 'error'
                  ? 'text-[#DC2626]'
                  : t.variant === 'warning'
                  ? 'text-[#F59E0B]'
                  : 'text-[#2563EB]'
              )}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#171717]">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-[#737373]">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="text-[#737373] hover:text-[#171717] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
