import type { LeadStatus } from '../types';

export const STATUS_FLOW: Record<LeadStatus, LeadStatus[]> = {
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['CONVERTED', 'LOST'],
  CONVERTED: [],
  LOST: [],
};

export function getValidNextStatuses(currentStatus: LeadStatus): LeadStatus[] {
  return STATUS_FLOW[currentStatus] || [];
}

export function isValidTransition(from: LeadStatus, to: LeadStatus): boolean {
  if (from === to) return true;
  return getValidNextStatuses(from).includes(to);
}
