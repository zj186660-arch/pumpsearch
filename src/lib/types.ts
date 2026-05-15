export type CompanyRole =
  | "制造商"
  | "贸易商"
  | "代理商"
  | "经销商"
  | "工程公司"
  | "EPC"
  | "进口商"
  | "批发商";

export type RelationType =
  | "长期采购"
  | "展会合作"
  | "竞争"
  | "供应链"
  | "疑似换供"
  | "海关往来"
  /** 来自同一搜索批次写入语料库的共现（非工商登记） */
  | "同次检索共现"
  /** 基于父域/二级域的弱关联（仅供参考） */
  | "父域相近";

export interface CompanyScore {
  activity: number;
  procurement: number;
  replyLikelihood: number;
  marketSize: number;
  dealProbability: number;
}

export interface Contact {
  label: string;
  value: string;
  verified: "public" | "unverified";
}

export interface Company {
  id: string;
  name: string;
  nameLocal?: string;
  country: string;
  city: string;
  role: CompanyRole;
  website: string;
  description: string;
  products: string[];
  exportMarkets: string[];
  chinaSourcingHint?: string;
  score: CompanyScore;
  contacts: Contact[];
  signals: string[];
  founded?: string;
  employees?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: RelationType;
  confidence: number;
  note: string;
}

export interface PipelineStep {
  id: string;
  title: string;
  detail: string;
  status: "done" | "running" | "queued";
}

export interface TrendRegion {
  country: string;
  heat: number;
  note: string;
}

export interface ProcurementLead {
  id: string;
  title: string;
  region: string;
  pumpType: string;
  urgency: "高" | "中" | "低";
}
