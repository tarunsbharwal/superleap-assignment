export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source?: string;
  created_at: string;
  updated_at: string;
}

export type LeadCreateInput = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type LeadUpdateInput = Partial<LeadCreateInput>;
