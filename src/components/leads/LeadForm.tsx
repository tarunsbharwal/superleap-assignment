import React, { useState, useEffect } from 'react';
import type { Lead, LeadCreateInput, LeadStatus } from '../../types';

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: LeadCreateInput) => Promise<boolean>;
  onCancel: () => void;
}

export function LeadForm({ initialData, onSubmit, onCancel }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadCreateInput>({
    name: '',
    email: '',
    phone: '',
    status: 'NEW',
    source: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone || '',
        status: initialData.status,
        source: initialData.source || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await onSubmit(formData);
    if (success) {
      // Don't reset if we succeed, the parent handles closing
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          type="text"
          className="form-input"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) {
              const newErrors = { ...errors };
              delete newErrors.name;
              setErrors(newErrors);
            }
          }}
          placeholder="Jane Doe"
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Email Address *</label>
        <input
          type="email"
          className="form-input"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) {
              const newErrors = { ...errors };
              delete newErrors.email;
              setErrors(newErrors);
            }
          }}
          placeholder="jane@example.com"
        />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <input
          type="tel"
          className="form-input"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="flex gap-4">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
            disabled={!!initialData} // Usually status is changed via specific actions
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Source</label>
          <select
            className="form-select"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          >
            <option value="">Select source...</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="campaign">Campaign</option>
            <option value="direct">Direct</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-between" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
