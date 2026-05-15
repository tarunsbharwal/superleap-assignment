import React, { useState, useRef, useEffect } from 'react';
import type { LeadStatus } from '../../types';
import { getValidNextStatuses } from '../../utils/status';
import { ChevronDown } from 'lucide-react';
import { classNames } from '../../utils/format';

interface StatusDropdownProps {
  currentStatus: LeadStatus;
  onStatusChange: (newStatus: LeadStatus) => void;
  disabled?: boolean;
}

export function StatusDropdown({ currentStatus, onStatusChange, disabled }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const validNext = getValidNextStatuses(currentStatus);
  const isLocked = validNext.length === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button 
        className={classNames('badge', `badge-${currentStatus}`)}
        onClick={() => !isLocked && !disabled && setIsOpen(!isOpen)}
        style={{ 
          cursor: isLocked || disabled ? 'not-allowed' : 'pointer',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          opacity: disabled ? 0.7 : 1
        }}
        disabled={isLocked || disabled}
        title={isLocked ? "Status is locked" : "Change status"}
      >
        {currentStatus}
        {!isLocked && <ChevronDown size={14} />}
      </button>

      {isOpen && !isLocked && !disabled && (
        <div className="dropdown-menu">
          <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
            Move to...
          </div>
          {validNext.map(status => (
            <button
              key={status}
              className="dropdown-item"
              onClick={() => {
                onStatusChange(status);
                setIsOpen(false);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={classNames('badge', `badge-${status}`)} style={{ transform: 'scale(0.8)', transformOrigin: 'left center' }}>
                  {status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
