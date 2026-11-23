import { CheckCircle2, Clock, AlertTriangle, XCircle, Truck, Package } from 'lucide-react';
import { cn } from '../../lib/cn';

type SemanticTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const STATUS_MAP: Record<string, { label: string; tone: SemanticTone; icon?: 'check' | 'clock' | 'warn' | 'error' | 'truck' | 'pack' }> = {
  pending: { label: 'Pending', tone: 'warning', icon: 'clock' },
  confirmed: { label: 'Confirmed', tone: 'info', icon: 'check' },
  assigned: { label: 'Assigned to Supplier', tone: 'info', icon: 'pack' },
  processing: { label: 'Processing', tone: 'info', icon: 'clock' },
  packed: { label: 'Packed', tone: 'info', icon: 'pack' },
  shipped: { label: 'Shipped', tone: 'info', icon: 'truck' },
  delivered: { label: 'Delivered', tone: 'success', icon: 'check' },
  cancelled: { label: 'Cancelled', tone: 'danger', icon: 'error' },
  unassigned: { label: 'Unassigned', tone: 'neutral', icon: 'clock' },
  pending_acceptance: { label: 'Awaiting Acceptance', tone: 'warning', icon: 'clock' },
  accepted: { label: 'Accepted', tone: 'info', icon: 'check' },
  rejected: { label: 'Rejected', tone: 'danger', icon: 'error' },
  paid: { label: 'Paid', tone: 'success', icon: 'check' },
  pending_cod: { label: 'COD Due', tone: 'warning', icon: 'clock' },
  awaiting_payment: { label: 'Awaiting Payment', tone: 'warning', icon: 'warn' },
  refunded: { label: 'Refunded', tone: 'neutral', icon: 'check' },
  failed: { label: 'Failed', tone: 'danger', icon: 'error' },
  active: { label: 'Active', tone: 'success', icon: 'check' },
  draft: { label: 'Draft', tone: 'neutral', icon: 'clock' },
  approved: { label: 'Approved', tone: 'success', icon: 'check' },
  hidden: { label: 'Hidden', tone: 'neutral', icon: 'error' },
  requested: { label: 'Requested', tone: 'warning', icon: 'clock' },
  sent: { label: 'Sent to Supplier', tone: 'info', icon: 'truck' },
  received: { label: 'Received', tone: 'success', icon: 'check' },
};

const TONE_STYLES: Record<SemanticTone, string> = {
  neutral: 'text-[#525252] border-[#E5E5E5] bg-[#F8F8F7]',
  info: 'text-[#1D4ED8] border-[#BFDBFE] bg-[#EFF6FF]',
  success: 'text-[#15803D] border-[#BBF7D0] bg-[#F0FDF4]',
  warning: 'text-[#B45309] border-[#FDE68A] bg-[#FFFBEB]',
  danger: 'text-[#B91C1C] border-[#FECACA] bg-[#FEF2F2]',
};

export function StatusLabel({ status, className }: { status: string; className?: string }) {
  const entry = STATUS_MAP[status] ?? { label: status.replace(/_/g, ' '), tone: 'neutral' as SemanticTone };
  const Icon =
    entry.icon === 'check'
      ? CheckCircle2
      : entry.icon === 'clock'
      ? Clock
      : entry.icon === 'warn'
      ? AlertTriangle
      : entry.icon === 'error'
      ? XCircle
      : entry.icon === 'truck'
      ? Truck
      : entry.icon === 'pack'
      ? Package
      : null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap shrink-0',
        TONE_STYLES[entry.tone],
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      {entry.label}
    </span>
  );
}
