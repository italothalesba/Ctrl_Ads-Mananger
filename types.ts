export interface DemographicData {
  age: string;
  gender: 'male' | 'female' | 'unknown';
  spend: number;
  results: number;
}

export interface VideoMetrics {
  plays: number;
  avgTime: number;
  retention25: number;
  retention50: number;
  retention75: number;
  retention100: number;
}

export interface Metrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  reach?: number;
  frequency?: number;
  cpm?: number;
  // Messaging metrics
  messages?: number;
  costPerMessage?: number;
  // Breakdown & Video
  demographics?: DemographicData[];
  video?: VideoMetrics;
}

export interface Creative {
  id: string;
  type: 'image' | 'video';
  url: string;
  headline: string;
}

export interface Ad {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  creative: Creative;
  metrics: Metrics;
}

export interface AdSet {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  budget?: number;
  budgetType?: 'DAILY' | 'LIFETIME';
  audience: string;
  metrics: Metrics;
  ads: Ad[];
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  platform: 'facebook' | 'google' | 'tiktok';
  objective: string;
  metrics: Metrics;
  budget?: number;
  budgetType?: 'DAILY' | 'LIFETIME';
  startTime?: string;
  endTime?: string;
  adSets: AdSet[];
  creative: Creative; 
  audience: string;
}

export interface Client {
  id: string;
  name: string;
  avatar: string;
  industry: string;
  adAccountId?: string;
  accessToken?: string;
  lastSync?: string;
  campaigns: Campaign[];
}