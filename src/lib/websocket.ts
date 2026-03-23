import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

type WSEventHandler = (data: any) => void;

const WS_URL = `ws://${window.location.hostname}:5000/ws`;

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
const listeners = new Map<string, Set<WSEventHandler>>();

function connect() {
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return;

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handlers = listeners.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message.data));
        }
      } catch (err) {
        console.error('[WS] Parse error:', err);
      }
    };

    ws.onclose = () => {
      ws = null;
      reconnectTimeout = setTimeout(connect, 5000);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  } catch (err) {
    console.error('[WS] Connection error:', err);
    reconnectTimeout = setTimeout(connect, 5000);
  }
}

function subscribe(event: string, handler: WSEventHandler) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event)!.add(handler);
}

function unsubscribe(event: string, handler: WSEventHandler) {
  listeners.get(event)?.delete(handler);
}

/**
 * Hook to listen to WebSocket events and auto-invalidate queries
 */
export function useWebSocket() {
  const queryClient = useQueryClient();
  const handlersRef = useRef<Array<{ event: string; handler: WSEventHandler }>>([]);

  useEffect(() => {
    connect();

    // Auto-invalidate queries on OLT status changes
    const oltHandler: WSEventHandler = () => {
      queryClient.invalidateQueries({ queryKey: ['olts'] });
    };

    const signalHandler: WSEventHandler = () => {
      queryClient.invalidateQueries({ queryKey: ['signal-quality'] });
    };

    const incidentHandler: WSEventHandler = () => {
      queryClient.invalidateQueries({ queryKey: ['network-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['olts'] });
    };

    subscribe('OLT_STATUS_UPDATE', oltHandler);
    subscribe('SIGNAL_QUALITY_UPDATE', signalHandler);
    subscribe('INCIDENT_CREATED', incidentHandler);
    subscribe('OLT_STATUS_CHANGED', oltHandler);

    return () => {
      unsubscribe('OLT_STATUS_UPDATE', oltHandler);
      unsubscribe('SIGNAL_QUALITY_UPDATE', signalHandler);
      unsubscribe('INCIDENT_CREATED', incidentHandler);
      unsubscribe('OLT_STATUS_CHANGED', oltHandler);
    };
  }, [queryClient]);

  const on = useCallback((event: string, handler: WSEventHandler) => {
    subscribe(event, handler);
    handlersRef.current.push({ event, handler });
  }, []);

  return { on };
}

export { connect, subscribe, unsubscribe };
