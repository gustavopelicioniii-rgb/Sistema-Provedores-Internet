import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, StatusKey } from '@/lib/constants';

type StatusVariant = 'client' | 'invoice' | 'ticket' | 'network' | 'plan' | 'automation';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className = '' }: StatusBadgeProps) {
  const statusKey = status.toLowerCase().replace(' ', '_') as StatusKey;
  const colorConfig = STATUS_COLORS[statusKey] || STATUS_COLORS['pendente'];

  const displayLabel = status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const isCritical = statusKey === 'critica';

  return (
    <Badge
      className={`${colorConfig.bg} ${colorConfig.text} border ${colorConfig.border} cursor-default font-medium transition-all hover:shadow-md ${
        isCritical ? 'text-sm font-bold' : ''
      } ${className}`}
      variant="outline"
    >
      {displayLabel}
    </Badge>
  );
}
