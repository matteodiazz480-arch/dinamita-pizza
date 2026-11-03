import React, { useState, useEffect, useCallback } from "react";
import CrmLogin from "./CrmLogin";
import CrmDashboard from "./CrmDashboard";
import {
  crmCheckAuth,
  crmGetLeads,
  crmUpdateLead,
  crmCreateLead,
  crmDeleteLead,
  crmLogout,
} from "./crmApi";

export default function CrmApp({ onNavigateLanding }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [leads, setLeads] = useState([]);

  const loadLeads = useCallback(async () => {
    try {
      const res = await crmGetLeads();
      if (res.ok) {
        setLeads(res.leads || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    crmCheckAuth()
      .then((res) => {
        if (res.ok && res.authenticated) {
          setIsAuthenticated(true);
          loadLeads();
        } else {
          setIsAuthenticated(false);
        }
      })
      .finally(() => {
        setLoadingAuth(false);
      });
  }, [loadLeads]);

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    await loadLeads();
  };

  const handleLogout = async () => {
    await crmLogout();
    setIsAuthenticated(false);
  };

  const handleUpdateLead = async (id, status, notes) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id || l.refId === id) {
          return {
            ...l,
            ...(status !== undefined ? { status } : {}),
            ...(notes !== undefined ? { notes } : {}),
          };
        }
        return l;
      })
    );
    await crmUpdateLead(id, status, notes);
    loadLeads();
  };

  const handleCreateLead = async (leadData) => {
    const res = await crmCreateLead(leadData);
    if (res.ok && res.lead) {
      setLeads((prev) => [res.lead, ...prev]);
    } else {
      loadLeads();
    }
  };

  const handleDeleteLead = async (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id && l.refId !== id));
    await crmDeleteLead(id);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Verificando acceso al CRM...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <CrmLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateLanding={onNavigateLanding}
      />
    );
  }

  return (
    <CrmDashboard
      leads={leads}
      onRefresh={loadLeads}
      onUpdateLead={handleUpdateLead}
      onCreateLead={handleCreateLead}
      onDeleteLead={handleDeleteLead}
      onLogout={handleLogout}
      onNavigateLanding={onNavigateLanding}
    />
  );
}
