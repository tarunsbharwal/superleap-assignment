import type { Lead, LeadCreateInput, LeadUpdateInput } from '../types';

const API_BASE = 'http://localhost:3001/leads';

export const api = {
  async getLeads(): Promise<Lead[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  async createLead(data: LeadCreateInput): Promise<Lead> {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create lead');
    return res.json();
  },

  async updateLead(id: string, data: LeadUpdateInput): Promise<Lead> {
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return res.json();
  },

  async deleteLead(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete lead');
  }
};
