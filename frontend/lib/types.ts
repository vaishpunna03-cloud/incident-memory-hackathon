export interface Service {
  id: string;
  name: string;
  description?: string;
  tier: string;
  dependencies: string[];
  status: string;
  created_at: string;
  incident_count: number;
  memory_count: number;
  recurring_causes: string[];
}

export interface SimilarityFactors {
  service_match: number;
  error_similarity: number;
  deployment_context: number;
  failure_pattern: number;
}

export interface HistoricalMatch {
  incident_id: string;
  service_id: string;
  relevance_score: number;
  factors: SimilarityFactors;
  original_error: string;
  root_cause: string;
  successful_fix: string;
  failed_attempt?: string;
  deployment_context?: string;
  lesson_learned: string;
  runbook_step?: string;
  date: string;
  retrieval_reason: string;
}

export interface EvidenceChainStep {
  step_id: number;
  title: string;
  description: string;
  evidence_type: "current" | "historical" | "synthesis" | "conclusion";
  icon?: string;
  details?: string;
}

export interface WhyFactor {
  factor: string;
  explanation: string;
  weight: string;
}

export interface Investigation {
  incident_id: string;
  summary: string;
  likely_root_cause: string;
  confidence: string;
  relevance_score: number;
  current_evidence: string[];
  historical_matches: HistoricalMatch[];
  evidence_chain: EvidenceChainStep[];
  why_factors: WhyFactor[];
  what_worked_before: string[];
  what_failed_before: string[];
  recommended_steps: string[];
  verification_steps: string[];
  risk_unknowns: string[];
  prevention_recommendations: string[];
  memory_used: boolean;
  is_contextual: boolean;
  created_at: string;
}

export interface IncidentEvent {
  id: string;
  incident_id: string;
  event_type: string;
  description: string;
  timestamp: string;
  metadata_json?: Record<string, any>;
}

export interface Resolution {
  id: string;
  incident_id: string;
  root_cause: string;
  fix_applied: string;
  result: string;
  lessons_learned: string;
  failed_attempts?: string;
  resolved_by: string;
  created_at: string;
}

export interface Incident {
  id: string;
  service_id: string;
  title: string;
  error_message: string;
  description?: string;
  environment: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "active" | "investigating" | "resolved";
  deployment_version?: string;
  deployment_commit?: string;
  incident_timestamp?: string;
  created_at: string;
  resolved_at?: string;
  historical_match_count: number;
  latest_investigation?: Investigation;
  resolution?: Resolution;
  events?: IncidentEvent[];
}

export interface MemoryRecord {
  id: string;
  incident_id: string;
  service_id: string;
  title: string;
  original_error: string;
  root_cause: string;
  successful_fix: string;
  failed_attempt?: string;
  deployment_context?: string;
  lesson_learned: string;
  runbook_step?: string;
  tags: string[];
  source: string;
  created_at: string;
}

export interface MemoryStats {
  total_memories: number;
  incidents_remembered: number;
  services_count: number;
  recent_memories: MemoryRecord[];
  provider_status: string;
  provider_name: string;
}

export interface Postmortem {
  id: string;
  incident_id: string;
  title: string;
  summary: string;
  impact: string;
  timeline: { time: string; event: string }[];
  root_cause: string;
  evidence: string[];
  what_worked: string[];
  what_failed: string[];
  resolution: string;
  lessons_learned: string[];
  prevention_recommendations: string[];
  author: string;
  status: string;
  created_at: string;
}

export interface HealthComponent {
  status: string;
  details?: string;
  latency_ms?: number;
}

export interface SystemHealth {
  status: string;
  environment: string;
  timestamp: string;
  backend: HealthComponent;
  database: HealthComponent;
  hindsight: HealthComponent;
  llm: HealthComponent;
  api: HealthComponent;
}

export interface DashboardStats {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  historical_memories: number;
  services_count: number;
  high_severity_incidents: number;
  system_health: SystemHealth;
  recent_incidents: Incident[];
}
