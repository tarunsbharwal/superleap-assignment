import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Columns, Settings } from 'lucide-react';
import { classNames } from '../utils/format';

export function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ 
          background: 'var(--primary)', 
          borderRadius: '8px', 
          width: '32px', 
          height: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          <Users size={18} strokeWidth={2.5} />
        </div>
        Superleap
      </div>
      
      <div className="nav-links">
        <NavLink 
          to="/leads" 
          className={({ isActive }) => classNames('nav-link', isActive ? 'active' : '')}
          end
        >
          <LayoutDashboard size={20} />
          List View
        </NavLink>
        <NavLink 
          to="/leads/board" 
          className={({ isActive }) => classNames('nav-link', isActive ? 'active' : '')}
        >
          <Columns size={20} />
          Kanban Board
        </NavLink>
        <div style={{ margin: '1rem 0', borderBottom: '1px solid var(--border-color)' }} />
        <a href="#" className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <Settings size={20} />
          Settings
        </a>
      </div>
    </div>
  );
}
