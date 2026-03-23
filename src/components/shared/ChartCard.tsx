import { ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onExpand?: () => void;
  minHeight?: string;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  onExpand,
  minHeight = 'min-h-80',
  className = '',
}: ChartCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur transition-all hover:border-border/80 hover:bg-card/80 ${minHeight} ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border/50 p-6">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {onExpand && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onExpand}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}
