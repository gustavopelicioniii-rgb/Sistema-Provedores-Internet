// Central type definitions for NetAdmin
// Export all types from individual modules

export * from "./client";
export * from "./plan";
export * from "./invoice";
export * from "./ticket";
export * from "./network";
export * from "./automation";
export * from "./user";
export * from "./common";

// Auth types
export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}
