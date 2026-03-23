import { GlassCard } from '@/components/shared/GlassCard';
import { AlertTriangle, CheckCircle, Clock, WifiOff, Wrench, Scissors } from 'lucide-react';

interface Incident {
  id: string;
  type: string;
  description?: string;
  olt_name?: string;
  olt_ip?: string;
  clients_affected: number;
  severity: string;
  started_at: string;
  resolved_at?: string;
  duration_minutes?: number;
}

interface IncidentTimelineProps {
  incidents: Incident[];
  isLoading: boolean;
}

const TYPE_ICONS: Record<string, any> = {
  offline: WifiOff,
  degradation: AlertTriangle,
  maintenance: Wrench,
  fiber_cut: Scissors,
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
  medium: { bg: 'rgba(245,158,11,0.1)', text: '#D97706' },
  high: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626' },
  critical: { bg: 'rgba(220,38,38,0.2)', text: '#DC2626' },
};

export function IncidentTimeline({ incidents, isLoading }: IncidentTimelineProps) {
  if (isLoading) {
    return (
      <GlassCard>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-8 w-8 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (incidents.length === 0) {
    return (
      <GlassCard>
        <div className="p-8 text-center">
          <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="text-sm font-medium">Nenhum incidente registrado</p>
          <p className="text-xs text-muted-foreground">Rede operando normalmente</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-4">Timeline de Incidentes</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {incidents.map((incident) => {
              const Icon = TYPE_ICONS[incident.type] || AlertTriangle;
              const sevColors = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.medium;
              const isResolved = !!incident.resolved_at;
              const startDate = new Date(incident.started_at);
              const duration = incident.duration_minutes
                ? `${Math.floor(incident.duration_minutes / 60)}h ${incident.duration_minutes % 60}min`
                : incident.resolved_at
                  ? `${Math.floor((new Date(incident.resolved_at).getTime() - startDate.getTime()) / 60000)}min`
                  : 'Em andamento';

              return (
                <div key={incident.id} className="relative flex gap-3 pl-1">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isResolved ? 'bg-success/10' : ''
                    }`}
                    style={!isResolved ? { background: sevColors.bg } : undefined}
                  >
                    {isResolved ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Icon className="h-4 w-4" style={{ color: sevColors.text }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {incident.olt_name || 'Rede'} - {incident.type.replace('_', ' ')}
                        </p>
                        {incident.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {incident.description}
                          </p>
                        )}
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ background: sevColors.bg, color: sevColors.text }}
                      >
                        {incident.severity}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {startDate.toLocaleDateString('pt-BR')}{' '}
                        {startDate.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>Duracao: {duration}</span>
                      {incident.clients_affected > 0 && (
                        <span className="font-medium text-destructive">
                          {incident.clients_affected} clientes afetados
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
