export type EquipmentStatus = "online" | "alerta" | "offline";

export interface Equipment {
  id: string;
  name: string;
  ip: string;
  port: string;
  clientCount: number;
  status: EquipmentStatus;
  uptime: string;           // percentage or duration
  signalStrength?: number;  // dBm
  manufacturer?: string;
  model?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface OLT extends Equipment {
  region?: string;
  capacity: number;
  usedCapacity: number;
}

export interface OLTHealth {
  oltId: string;
  oltName: string;
  uptime: number;
  signalQuality: number;
  packetLoss: number;
  lastIncident?: string;
  incidentCount: number;
}

export interface OLTIncident {
  id: string;
  oltId: string;
  oltName: string;
  type: "offline" | "degradation" | "alert";
  severity: "baixa" | "media" | "alta" | "critica";
  startTime: string;
  endTime?: string;
  affectedClients: number;
  cause?: string;
  resolution?: string;
}

export interface SignalQuality {
  timestamp: string;
  oltId: string;
  signalStrength: number;  // dBm
  bandwidth: number;       // Mbps
  latency: number;         // ms
  packetLoss: number;      // percentage
}

export interface ClientAtRisk {
  clientId: string;
  clientName: string;
  riskScore: number;       // 0-100
  reason: string;
  signalQuality: number;
  resolution?: string;
}
