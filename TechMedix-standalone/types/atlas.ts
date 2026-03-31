// Atlas API TypeScript interfaces
// Generated from Atlas CLI output shapes

export interface AtlasCompany {
  id: string;
  name: string;
  type: "oem" | "component_maker" | "ai_compute" | "raw_material" | "investor";
  country: string;
  description?: string;
  plyModel?: string;
  robotImage?: string;
  robotSpecs?: AtlasRobotSpecs;
}

export interface AtlasRobotSpecs {
  status: string;
  launchDate?: string;
  shipments2025?: number;
  shipmentShare?: string;
  targetUse?: string[];
  mass?: string;
  height?: string;
  speed?: string;
  totalDOF?: string;
  operatingTime?: string;
  payloadCapacity?: string;
  endEffector?: string;
  tactileSensing?: string | null;
  locomotion?: string;
  materials?: string;
  motor?: string;
  actuatorBody?: string;
  actuatorHand?: string;
  transmission?: string;
  externalSensors?: string;
  internalSensors?: string;
  compute?: string;
  battery?: string;
  charging?: string;
  aiPartner?: string;
  software?: string;
  dataCollection?: string;
  bom?: string;
  price?: string;
}

export interface AtlasComponent {
  id: string;
  name: string;
  description: string;
  plyModel?: string;
  avgCostPercent?: number;
  bottleneck: boolean;
  bottleneckReason?: string;
  keyMetrics?: Record<string, string>;
}

export interface AtlasRelationship {
  id: string;
  from: AtlasCompanyRef;
  to: AtlasCompanyRef;
  component: string;
  componentCategoryId: string;
  description?: string;
}

export interface AtlasCompanyRef {
  id: string;
  name: string;
  type: string;
  country: string;
}

export interface AtlasSupplyChainNode {
  id: string;
  name: string;
  type: string;
  country: string;
  depth: number;
  direction: "root" | "upstream" | "downstream";
  ticker?: string;
  marketShare?: string;
  isBottleneckSupplier: boolean;
}

export interface AtlasSupplyChainGraph {
  root: string;
  nodes: AtlasSupplyChainNode[];
  edges?: Array<{
    from: string;
    to: string;
    component: string;
    componentCategoryId: string;
  }>;
}

export interface AtlasCompanyProfile {
  company: AtlasCompany;
  suppliers: AtlasRelationship[];
}

export interface AtlasQueryResult {
  answer: string;
  companyIds: string[];
  intent: "list" | "explain" | "compare";
}

// BlackCat OS DB types

export type ComponentType = "motor" | "battery" | "actuator" | "sensor" | "pcb" | "reducer" | "hand" | "bearing";
export type CriticalityLevel = "high" | "medium" | "low";
export type ProcedureType = "maintenance" | "replacement" | "calibration";
export type OverlayType = "outline" | "arrow" | "highlight";
export type JobStatus = "pending" | "in_progress" | "completed";

export interface Supplier {
  id: string;
  name: string;
  component_type: string;
  website?: string;
  unit_price?: number;
  region?: string;
  country?: string;
  atlas_supplier_id?: string;
  market_share?: string;
  ticker?: string;
  is_bottleneck: boolean;
  created_at: string;
}

export interface RobotProfile {
  id: string;
  robot_id: string;
  model: string;
  oem: string;
  description?: string;
  image_url?: string;
  specs: AtlasRobotSpecs;
  atlas_company_id?: string;
}

export interface Component {
  id: string;
  robot_id: string;
  name: string;
  type: ComponentType;
  oem_supplier_id?: string;
  cost?: number;
  availability?: string;
  criticality: CriticalityLevel;
  atlas_component_id?: string;
  description?: string;
  created_at: string;
  suppliers?: Supplier;
}

export interface ProcedureStep {
  step: number;
  title: string;
  instruction: string;
  warning?: string | null;
}

export interface Procedure {
  id: string;
  component_id: string;
  procedure_type: ProcedureType;
  title: string;
  steps: ProcedureStep[];
  estimated_minutes?: number;
  ai_guidance_enabled: boolean;
  created_at: string;
  components?: Component;
}

export interface ARGuidanceStep {
  step: number;
  color: string;
  label: string;
}

export interface AROverlay {
  id: string;
  component_id: string;
  visual_zone: string;
  overlay_type: OverlayType;
  guidance_steps: ARGuidanceStep[];
  created_at: string;
  components?: Component;
}

export interface Certification {
  id: string;
  name: string;
  level: number;
  description?: string;
  modules_required: string[];
  simulations_required: number;
  real_repairs_required: number;
  ai_score_threshold: number;
  created_at: string;
}

export interface TechnicianCertification {
  technician_id: string;
  certification_id: string;
  earned_at: string;
  ai_score?: number;
  certifications?: Certification;
}

export interface Job {
  id: string;
  robot_id?: string;
  technician_id?: string;
  procedure_id?: string;
  component_id?: string;
  status: JobStatus;
  timestamps: {
    created?: string;
    started?: string;
    completed?: string;
  };
  ai_feedback: Record<string, string>;
  completion_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  procedures?: Procedure;
  components?: Component;
}

export interface AIAgent {
  id: string;
  technician_id: string;
  trained_procedure_ids: string[];
  voice_enabled: boolean;
  realtime_guidance_enabled: boolean;
  created_at: string;
}

// AR Body zone identifiers
export type BodyZone =
  | "head"
  | "torso"
  | "left_shoulder"
  | "right_shoulder"
  | "left_elbow"
  | "right_elbow"
  | "left_hip"
  | "right_hip"
  | "left_knee"
  | "right_knee"
  | "left_foot"
  | "right_foot";
