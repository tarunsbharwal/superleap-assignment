import React, { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import type { Lead, LeadCreateInput } from '../types';
import { LeadForm } from '../components/leads/LeadForm';
import { Modal } from '../components/ui/Modal';
import { Search, Plus, Filter, Trash2, Edit2, Inbox } from 'lucide-react';
import { StatusDropdown } from '../components/leads/StatusDropdown';
import { formatTimeAgo } from '../utils/format';

export function LeadsPage() {
  const { 
    filteredLeads, 
    loading, 
    error, 
    searchQuery, 
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    createLead,
    updateLead,
    deleteLead
  } = useLeads();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCreateSubmit = async (data: LeadCreateInput) => {
    const success = await createLead(data);
    if (success) setIsCreateModalOpen(false);
    return success;
  };

  const handleEditSubmit = async (data: LeadCreateInput) => {
    if (!editingLead) return false;
    const success = await updateLead(editingLead.id, data);
    if (success) setEditingLead(null);
    return success;
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLead) return;
    await deleteLead(deletingLead.id);
    setDeletingLead(null);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(deletingLead.id);
      return next;
    });
  };

  if (loading && filteredLeads.length === 0) {
    return (
      <div className="empty-state">
        <div className="spinner"></div>
        <p className="mt-4">Loading leads...</p>
      </div>
    );
  }

  if (error && filteredLeads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <p>{error}</p>
        <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Leads</h1>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <Search className="icon" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} className="icon" style={{ color: 'var(--text-secondary)' }} />
          <select 
            className="form-select" 
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="filters-bar" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--primary-text)' }}>{selectedIds.size}</span> leads selected
          </div>
          <div className="flex gap-2">
            <button className="btn btn-danger" onClick={() => {
              // Just a simplified bulk delete for now to meet UI requirement
              if (window.confirm(`Delete ${selectedIds.size} leads?`)) {
                selectedIds.forEach(id => deleteLead(id));
                setSelectedIds(new Set());
              }
            }}>
              <Trash2 size={16} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {filteredLeads.length === 0 ? (
        <div className="empty-state">
          <Inbox className="empty-icon" />
          <h3>No leads found</h3>
          <p>Try adjusting your search or filters, or add a new lead.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Status</th>
                <th>Source</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(lead.id)}
                      onChange={() => handleSelectOne(lead.id)}
                    />
                  </td>
                  <td>
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-email">{lead.email}</div>
                  </td>
                  <td>
                    <StatusDropdown 
                      currentStatus={lead.status} 
                      onStatusChange={(status) => updateLead(lead.id, { status })} 
                    />
                  </td>
                  <td>
                    {lead.source && (
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', fontSize: '0.875rem' }}>
                        {lead.source}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {formatTimeAgo(lead.updated_at)}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon btn-ghost" onClick={() => setEditingLead(lead)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setDeletingLead(lead)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New Lead">
        <LeadForm onSubmit={handleCreateSubmit} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingLead} onClose={() => setEditingLead(null)} title="Edit Lead">
        {editingLead && (
          <LeadForm initialData={editingLead} onSubmit={handleEditSubmit} onCancel={() => setEditingLead(null)} />
        )}
      </Modal>

      <Modal 
        isOpen={!!deletingLead} 
        onClose={() => setDeletingLead(null)} 
        title="Confirm Deletion"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeletingLead(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete Lead</button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{deletingLead?.name}</strong>? This action cannot be undone.</p>
      </Modal>
    </>
  );
}
