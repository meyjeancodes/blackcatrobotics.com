export interface RepairRow {
  scooter_id?: string;
  platform?: string;
  fault_code?: string;
  summary?: string;
  parts_used?: Record<string, unknown>;
  duration_min?: number;
}

export interface FailureRow {
  scooter_id?: string;
  platform?: string;
  fault_code?: string;
  symptom?: string;
}

export interface UiPrefRow {
  key: string;
  value: string;
}
