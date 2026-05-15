import React, { useMemo } from 'react';
import { useLeads } from '../hooks/useLeads';
import type { LeadStatus } from '../types';
import { getValidNextStatuses, isValidTransition } from '../utils/status';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Search, Filter, Lock } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { formatTimeAgo, classNames } from '../utils/format';

const COLUMNS: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

export function BoardPage() {
  const { 
    filteredLeads, 
    updateLead,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
  } = useLeads();
  const { error: toastError } = useToast();

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Group leads by status
  const leadsByStatus = useMemo(() => {
    const grouped = COLUMNS.reduce((acc, status) => {
      acc[status] = filteredLeads.filter(l => l.status === status);
      return acc;
    }, {} as Record<LeadStatus, typeof filteredLeads>);
    return grouped;
  }, [filteredLeads]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const activeLead = filteredLeads.find(l => l.id === leadId);
    if (!activeLead) return;

    // determine target status. Over id could be a column or another card
    const overId = String(over.id);
    let targetStatus: LeadStatus | null = null;
    
    if (COLUMNS.includes(overId as LeadStatus)) {
      targetStatus = overId as LeadStatus;
    } else {
      const overLead = filteredLeads.find(l => l.id === overId);
      if (overLead) targetStatus = overLead.status;
    }

    if (targetStatus && targetStatus !== activeLead.status) {
      if (isValidTransition(activeLead.status, targetStatus)) {
        updateLead(leadId, { status: targetStatus });
      } else {
        toastError(`Invalid transition: Cannot move from ${activeLead.status} to ${targetStatus}`);
      }
    }
  };

  const activeLead = useMemo(() => filteredLeads.find(l => l.id === activeId), [activeId, filteredLeads]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Kanban Board</h1>
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

      <div className="board-container">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(status => {
            const isLocked = getValidNextStatuses(status).length === 0;
            return (
              <BoardColumn 
                key={status} 
                status={status} 
                leads={leadsByStatus[status] || []}
                isLocked={isLocked}
              />
            )
          })}
          
          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
}

function BoardColumn({ status, leads, isLocked }: { status: LeadStatus, leads: any[], isLocked: boolean }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status }
  });

  return (
    <div className="board-column" ref={setNodeRef}>
      <div className="column-header">
        <div className="column-title">
          <span className={classNames('badge', `badge-${status}`)} style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>{status}</span>
          {isLocked && <Lock size={14} style={{ color: 'var(--text-tertiary)' }} title="Locked State" />}
        </div>
        <div className="column-count">{leads.length}</div>
      </div>
      <div className="column-content">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <SortableLeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

function SortableLeadCard({ lead }: { lead: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id, data: { type: 'Lead', lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, isOverlay }: { lead: any, isOverlay?: boolean }) {
  return (
    <div className="lead-card" style={{ boxShadow: isOverlay ? 'var(--shadow-lg)' : 'var(--shadow-sm)' }}>
      <div className="card-title">{lead.name}</div>
      <div className="card-subtitle">{lead.email}</div>
      <div className="card-footer">
        <span style={{ textTransform: 'capitalize' }}>{lead.source || 'Unknown'}</span>
        <span>{formatTimeAgo(lead.updated_at)}</span>
      </div>
    </div>
  );
}
