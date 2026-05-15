import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Lead, LeadCreateInput, LeadUpdateInput, LeadStatus } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/ui/ToastProvider';

interface LeadsContextType {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  createLead: (data: LeadCreateInput) => Promise<boolean>;
  updateLead: (id: string, data: LeadUpdateInput) => Promise<boolean>;
  deleteLead: (id: string) => Promise<boolean>;
  filteredLeads: Lead[];
  
  // URL state
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || '';

  const updateParams = useCallback((key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const setSearchQuery = (q: string) => updateParams('q', q);
  const setStatusFilter = (s: string) => updateParams('status', s);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLeads();
      // Sort by updated_at descending
      setLeads(data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    } catch (err) {
      setError('Failed to load leads.');
      toastError('Failed to load leads from the server.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = async (data: LeadCreateInput) => {
    try {
      const newLead = await api.createLead(data);
      setLeads((prev) => [newLead, ...prev]);
      success('Lead created successfully');
      return true;
    } catch (err) {
      toastError('Failed to create lead.');
      return false;
    }
  };

  const updateLead = async (id: string, data: LeadUpdateInput) => {
    const oldLeads = [...leads];
    
    // Optimistic update
    setLeads((prev) => prev.map(lead => 
      lead.id === id ? { ...lead, ...data, updated_at: new Date().toISOString() } : lead
    ));

    try {
      await api.updateLead(id, data);
      success('Lead updated successfully');
      return true;
    } catch (err) {
      // Rollback
      setLeads(oldLeads);
      toastError('Failed to update lead. Reverted to previous state.');
      return false;
    }
  };

  const deleteLead = async (id: string) => {
    const oldLeads = [...leads];
    
    // Optimistic update
    setLeads((prev) => prev.filter(lead => lead.id !== id));

    try {
      await api.deleteLead(id);
      success('Lead deleted successfully');
      return true;
    } catch (err) {
      // Rollback
      setLeads(oldLeads);
      toastError('Failed to delete lead. Reverted to previous state.');
      return false;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <LeadsContext.Provider value={{
      leads,
      loading,
      error,
      fetchLeads,
      createLead,
      updateLead,
      deleteLead,
      filteredLeads,
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter
    }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) throw new Error('useLeads must be used within LeadsProvider');
  return context;
}
