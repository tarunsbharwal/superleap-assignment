import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { LeadsPage } from './pages/LeadsPage';
import { BoardPage } from './pages/BoardPage';
import { LeadsProvider } from './hooks/useLeads';
import { ToastProvider } from './components/ui/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <LeadsProvider>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/leads" replace />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/board" element={<BoardPage />} />
            </Routes>
          </main>
        </div>
      </LeadsProvider>
    </ToastProvider>
  );
}

export default App;
