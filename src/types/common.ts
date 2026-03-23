export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: Array<{ field: string; message: string }>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface WSMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
}

export interface KPIData {
  label: string;
  value: string | number;
  trend?: number;        // percentage
  trendDirection?: "up" | "down" | "neutral";
  icon?: string;
  color?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: string;
  [key: string]: string | number | undefined;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  key: string;
  value: string | number | boolean | string[];
  operator?: "equals" | "contains" | "greater_than" | "less_than";
}
