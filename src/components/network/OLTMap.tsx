import { useEffect, useRef } from "react";
import { GlassCard } from "@/components/GlassCard";

interface OLT {
  id: string;
  name: string;
  status: string;
  latitude?: number;
  longitude?: number;
  ip_address: string;
  clients_connected?: number;
  signal_quality?: number;
  uptime_seconds?: number;
  model?: string;
}

interface OLTMapProps {
  olts: OLT[];
  onOLTClick: (olt: OLT) => void;
  selectedOLTId?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  online: "#10B981",
  warning: "#F59E0B",
  offline: "#EF4444",
  maintenance: "#6B7280",
};

export function OLTMap({ olts, onOLTClick, selectedOLTId }: OLTMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamic import for Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      if (!mapRef.current) return;

      // Center on Sao Paulo area
      const map = L.map(mapRef.current).setView([-23.55, -46.63], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers for each OLT
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      olts.forEach((olt) => {
        const lat = olt.latitude || -23.55 + (Math.random() - 0.5) * 0.2;
        const lng = olt.longitude || -46.63 + (Math.random() - 0.5) * 0.2;
        const color = STATUS_COLORS[olt.status] || STATUS_COLORS.offline;
        const isSelected = olt.id === selectedOLTId;

        const icon = L.divIcon({
          className: "custom-olt-marker",
          html: `
            <div style="
              width: ${isSelected ? 28 : 22}px;
              height: ${isSelected ? 28 : 22}px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3)${isSelected ? ', 0 0 0 4px ' + color + '40' : ''};
              cursor: pointer;
              transition: all 0.2s;
            "></div>
          `,
          iconSize: [isSelected ? 28 : 22, isSelected ? 28 : 22],
          iconAnchor: [isSelected ? 14 : 11, isSelected ? 14 : 11],
        });

        const uptimeDays = olt.uptime_seconds ? Math.floor(olt.uptime_seconds / 86400) : 0;
        const uptimeHours = olt.uptime_seconds ? Math.floor((olt.uptime_seconds % 86400) / 3600) : 0;

        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px; font-family: system-ui, sans-serif;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${olt.name}</div>
              <div style="display: grid; gap: 4px; font-size: 12px;">
                <div><strong>IP:</strong> ${olt.ip_address}</div>
                <div><strong>Modelo:</strong> ${olt.model || '-'}</div>
                <div><strong>Status:</strong> <span style="color: ${color}; font-weight: 600;">${olt.status.toUpperCase()}</span></div>
                <div><strong>Clientes:</strong> ${olt.clients_connected || 0}</div>
                <div><strong>Sinal:</strong> ${olt.signal_quality || 0}%</div>
                <div><strong>Uptime:</strong> ${uptimeDays}d ${uptimeHours}h</div>
              </div>
            </div>
          `);

        marker.on("click", () => onOLTClick(olt));
        markersRef.current.push(marker);
      });

      // Fit bounds if we have markers
      if (olts.length > 0) {
        const validOlts = olts.filter(o => o.latitude && o.longitude);
        if (validOlts.length > 1) {
          const bounds = L.latLngBounds(validOlts.map(o => [o.latitude!, o.longitude!]));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }

      // Force resize
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [olts, selectedOLTId, onOLTClick]);

  return (
    <GlassCard hover>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Mapa de OLTs</h3>
            <p className="text-[10px] text-muted-foreground">Clique em um marcador para ver detalhes</p>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <span key={status} className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            ))}
          </div>
        </div>
        <div ref={mapRef} className="h-[400px] rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }} />
      </div>
    </GlassCard>
  );
}
