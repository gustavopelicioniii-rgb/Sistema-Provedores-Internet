import { GlassCard } from "@/components/GlassCard";

interface RegionData {
  region: string;
  status: string;
  olt_count: number;
  client_count: number;
  quality: string;
}

interface RegionHeatmapProps {
  data: RegionData[];
  isLoading: boolean;
  onRegionClick?: (region: string) => void;
}

function getQualityColor(quality: number): string {
  if (quality >= 90) return "#10B981";
  if (quality >= 75) return "#84CC16";
  if (quality >= 60) return "#F59E0B";
  if (quality >= 40) return "#F97316";
  return "#EF4444";
}

function getQualityBg(quality: number): string {
  if (quality >= 90) return "rgba(16,185,129,0.1)";
  if (quality >= 75) return "rgba(132,204,22,0.1)";
  if (quality >= 60) return "rgba(245,158,11,0.1)";
  if (quality >= 40) return "rgba(249,115,22,0.1)";
  return "rgba(239,68,68,0.1)";
}

export function RegionHeatmap({ data, isLoading, onRegionClick }: RegionHeatmapProps) {
  if (isLoading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="h-4 w-40 bg-muted rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  // Aggregate by region
  const regions = new Map<string, { olts: number; clients: number; qualitySum: number; count: number; statuses: string[] }>();
  data.forEach((d) => {
    const existing = regions.get(d.region) || { olts: 0, clients: 0, qualitySum: 0, count: 0, statuses: [] };
    existing.olts += d.olt_count;
    existing.clients += d.client_count;
    existing.qualitySum += parseFloat(d.quality);
    existing.count += 1;
    existing.statuses.push(d.status);
    regions.set(d.region, existing);
  });

  const regionList = Array.from(regions.entries()).map(([name, data]) => ({
    name,
    olts: data.olts,
    clients: data.clients,
    quality: data.count > 0 ? data.qualitySum / data.count : 0,
    hasOffline: data.statuses.includes('offline'),
    hasWarning: data.statuses.includes('warning'),
  }));

  return (
    <GlassCard hover>
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold">Heatmap por Regiao</h3>
          <p className="text-[10px] text-muted-foreground">Qualidade da rede por localizacao</p>
        </div>

        {regionList.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Sem dados de regiao</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {regionList.map((region) => {
              const color = getQualityColor(region.quality);
              const bg = getQualityBg(region.quality);

              return (
                <div
                  key={region.name}
                  className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                  style={{ background: bg, border: `1px solid ${color}20` }}
                  onClick={() => onRegionClick?.(region.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium truncate">{region.name}</span>
                    {(region.hasOffline || region.hasWarning) && (
                      <span className="h-2 w-2 rounded-full" style={{
                        background: region.hasOffline ? "#EF4444" : "#F59E0B"
                      }} />
                    )}
                  </div>
                  <div className="text-lg font-bold" style={{ color }}>
                    {region.quality.toFixed(0)}%
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{region.olts} OLTs</span>
                    <span>{region.clients} clientes</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: "#10B981" }} />Otimo (90+)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: "#F59E0B" }} />Regular (60-89)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: "#EF4444" }} />Critico (&lt;60)</span>
        </div>
      </div>
    </GlassCard>
  );
}
