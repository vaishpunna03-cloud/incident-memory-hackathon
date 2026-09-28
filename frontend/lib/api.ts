import {
  Incident,
  Investigation,
  Resolution,
  MemoryStats,
  MemoryRecord,
  HistoricalMatch,
  Service,
  Postmortem,
  SystemHealth,
  DashboardStats
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      },
      cache: "no-store"
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { detail: errorText || res.statusText };
      }
      throw new Error(errorJson.detail || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request<SystemHealth>("/health"),

  // Dashboard
  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),

  // Incidents
  getIncidents: (filters?: { service_id?: string; severity?: string; status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.service_id) params.append("service_id", filters.service_id);
    if (filters?.severity) params.append("severity", filters.severity);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<Incident[]>(`/incidents${qs}`);
  },

  getIncident: (id: string) => request<Incident>(`/incidents/${id}`),

  createIncident: (data: {
    service_id: string;
    title: string;
    error_message: string;
    description?: string;
    environment?: string;
    severity?: string;
    deployment_version?: string;
    deployment_commit?: string;
  }) => request<Incident>("/incidents", {
    method: "POST",
    body: JSON.stringify(data)
  }),

  investigateIncident: (id: string, use_memory: boolean = true) =>
    request<Investigation>(`/incidents/${id}/investigate?use_memory=${use_memory}`, {
      method: "POST"
    }),

  getIncidentMemory: (id: string) => request<HistoricalMatch[]>(`/incidents/${id}/memory`),

  resolveIncident: (id: string, data: {
    root_cause: string;
    fix_applied: string;
    result?: string;
    lessons_learned: string;
    failed_attempts?: string;
    resolved_by?: string;
  }) => request<Resolution>(`/incidents/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify(data)
  }),

  // Memory
  getMemoryStats: () => request<MemoryStats>("/memory/stats"),
  listMemories: (service_id?: string) => {
    const qs = service_id ? `?service_id=${service_id}` : "";
    return request<MemoryRecord[]>(`/memory${qs}`);
  },
  searchMemory: (query: string, service_id?: string) => {
    const params = new URLSearchParams({ q: query });
    if (service_id) params.append("service_id", service_id);
    return request<HistoricalMatch[]>(`/memory/search?${params.toString()}`);
  },
  retainMemory: (data: any) => request<MemoryRecord>("/memory/retain", {
    method: "POST",
    body: JSON.stringify(data)
  }),

  // Services
  getServices: () => request<Service[]>("/services"),
  getService: (id: string) => request<Service>(`/services/${id}`),

  // Postmortems
  getPostmortems: () => request<Postmortem[]>("/postmortems"),
  getPostmortem: (id: string) => request<Postmortem>(`/postmortems/${id}`),
  generatePostmortem: (incident_id: string, author?: string) =>
    request<Postmortem>("/postmortems", {
      method: "POST",
      body: JSON.stringify({ incident_id, author })
    }),

  // Demo
  getDemoBefore: () => request<any>("/demo/before"),
  getDemoAfter: () => request<any>("/demo/after"),
  resetDemo: () => request<any>("/demo/reset", { method: "POST" })
};
