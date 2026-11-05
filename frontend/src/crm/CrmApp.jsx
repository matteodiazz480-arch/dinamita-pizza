import React, { useState, useEffect, useCallback } from "react";
import CrmLogin from "./CrmLogin";
import CrmDashboard from "./CrmDashboard";
import {
  crmCheckAuth,
  crmGetLeads,
  crmSubscribeLeads,
  crmUpdateLead,
  crmCreateLead,
  crmDeleteLead,
  crmGetClients,
  crmCreateClient,
  crmUpdateClient,
  crmDeleteClient,
  crmGetCustomerProfiles,
  crmSubscribeCustomerProfiles,
  crmCreateCustomerProfile,
  crmUpdateCustomerProfile,
  crmDeleteCustomerProfile,
  crmAddCustomerFollowup,
  crmGetCampaigns,
  crmSubscribeCampaigns,
  crmCreateCampaign,
  crmUpdateCampaign,
  crmDeleteCampaign,
  crmCheckAndTriggerAutoBackup,
  crmGetExpenses,
  crmCreateExpense,
  crmDeleteExpense,
  crmLogout,
} from "./crmApi";

export default function CrmApp({ onNavigateLanding }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { username, role, name }
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [customerProfiles, setCustomerProfiles] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [leadsRes, clientsRes, customerRes, campaignsRes, expensesRes] = await Promise.all([
        crmGetLeads(),
        crmGetClients(),
        crmGetCustomerProfiles(),
        crmGetCampaigns(),
        crmGetExpenses(),
      ]);

      if (leadsRes.ok && Array.isArray(leadsRes.leads)) {
        setLeads(leadsRes.leads);
      }
      if (clientsRes.ok && Array.isArray(clientsRes.clients)) {
        setClients(clientsRes.clients);
      }
      if (customerRes.ok && Array.isArray(customerRes.profiles)) {
        setCustomerProfiles(customerRes.profiles);
      }
      if (campaignsRes.ok && Array.isArray(campaignsRes.campaigns)) {
        setCampaigns(campaignsRes.campaigns);
      }
      if (expensesRes.ok && Array.isArray(expensesRes.expenses)) {
        setExpenses(expensesRes.expenses);
      }
    } catch {
      // ignore
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  }, []);

  useEffect(() => {
    crmCheckAuth()
      .then((res) => {
        if (res.ok && res.authenticated) {
          setIsAuthenticated(true);
          setCurrentUser(res.user || { username: "admin", role: "admin", name: "Administrador" });
          loadAllData();
          // Comprobar y disparar copia de seguridad automática si pasaron 24h
          crmCheckAndTriggerAutoBackup();
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      })
      .finally(() => {
        setLoadingAuth(false);
      });
  }, [loadAllData]);

  // Suscripción en tiempo real a leads, fichas y campañas de Firestore
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubLeads = crmSubscribeLeads((realtimeLeads) => {
      if (Array.isArray(realtimeLeads)) {
        setLeads(realtimeLeads);
      }
    });

    const unsubProfiles = crmSubscribeCustomerProfiles((realtimeProfiles) => {
      if (Array.isArray(realtimeProfiles)) {
        setCustomerProfiles(realtimeProfiles);
      }
    });

    const unsubCampaigns = crmSubscribeCampaigns((realtimeCampaigns) => {
      if (Array.isArray(realtimeCampaigns)) {
        setCampaigns(realtimeCampaigns);
      }
    });

    return () => {
      if (typeof unsubLeads === "function") unsubLeads();
      if (typeof unsubProfiles === "function") unsubProfiles();
      if (typeof unsubCampaigns === "function") unsubCampaigns();
    };
  }, [isAuthenticated]);

  const handleLoginSuccess = async (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user || { username: "admin", role: "admin", name: "Administrador" });
    await loadAllData();
    crmCheckAndTriggerAutoBackup();
  };

  const handleLogout = async () => {
    await crmLogout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // --------------------------------------------------------------------------
  // HANDLERS: LEADS & PIPELINE COMERCIAL
  // --------------------------------------------------------------------------
  const handleUpdateLead = async (id, updatesOrStatus, maybeNotes) => {
    let updates = {};
    if (typeof updatesOrStatus === "object" && updatesOrStatus !== null) {
      updates = updatesOrStatus;
    } else {
      if (updatesOrStatus !== undefined) updates.status = updatesOrStatus;
      if (maybeNotes !== undefined) updates.notes = maybeNotes;
    }

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === id || l.refId === id ? { ...l, ...updates } : l))
    );

    await crmUpdateLead(id, updates);
    loadAllData();
  };

  const handleCreateLead = async (leadData) => {
    const res = await crmCreateLead(leadData);
    if (res.ok && res.lead) {
      setLeads((prev) => [res.lead, ...prev]);
    }
    loadAllData();
  };

  const handleDeleteLead = async (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id && l.refId !== id));
    await crmDeleteLead(id);
    loadAllData();
  };

  // Convertir oportunidad ganada a Cliente Activo
  const handleConvertToClient = async (lead) => {
    const clientData = {
      clientName: lead.businessName || lead.fullName,
      service: lead.service || "Publicidad Digital (Meta Ads)",
      responsible: lead.responsible || "Mateo Díaz",
      startDate: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      feeARS: Number(lead.feeARS) || 180000,
      adBudget: Number(lead.adBudget) || 100000,
      status: "activo",
      contact: lead.phone || "",
      notes: `Convertido desde oportunidad comercial ${lead.refId || lead.id}. ${lead.notes || ""}`.trim(),
    };

    const res = await crmCreateClient(clientData);
    if (res.ok && res.client) {
      setClients((prev) => [res.client, ...prev]);
    }
    await handleUpdateLead(lead.id || lead.refId, { status: "ganado" });
    loadAllData();
  };

  // --------------------------------------------------------------------------
  // HANDLERS: ATENCIÓN AL PÚBLICO (FICHAS COMPLETAS DE CLIENTES)
  // --------------------------------------------------------------------------
  const handleCreateCustomerProfile = async (profileData) => {
    const res = await crmCreateCustomerProfile(profileData);
    if (res.ok && res.profile) {
      setCustomerProfiles((prev) => [res.profile, ...prev]);
    }
    loadAllData();
    return res.ok;
  };

  const handleUpdateCustomerProfile = async (id, updates, changeDescription) => {
    setCustomerProfiles((prev) =>
      prev.map((p) => (p.id === id || p.refId === id ? { ...p, ...updates } : p))
    );
    const res = await crmUpdateCustomerProfile(id, updates, changeDescription);
    loadAllData();
    return res.ok;
  };

  const handleDeleteCustomerProfile = async (id) => {
    setCustomerProfiles((prev) => prev.filter((p) => p.id !== id && p.refId !== id));
    await crmDeleteCustomerProfile(id);
    loadAllData();
  };

  const handleAddCustomerFollowup = async (id, followupData) => {
    await crmAddCustomerFollowup(id, followupData);
    loadAllData();
  };

  // --------------------------------------------------------------------------
  // HANDLERS: MARKETING & PUBLICIDAD
  // --------------------------------------------------------------------------
  const handleCreateCampaign = async (campaignData) => {
    const res = await crmCreateCampaign(campaignData);
    if (res.ok && res.campaign) {
      setCampaigns((prev) => [res.campaign, ...prev]);
    }
    loadAllData();
    return res.ok;
  };

  const handleUpdateCampaign = async (id, updates) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    const res = await crmUpdateCampaign(id, updates);
    loadAllData();
    return res.ok;
  };

  const handleDeleteCampaign = async (id) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    await crmDeleteCampaign(id);
    loadAllData();
  };

  // --------------------------------------------------------------------------
  // HANDLERS: CLIENTES ACTIVOS
  // --------------------------------------------------------------------------
  const handleCreateClient = async (clientData) => {
    const res = await crmCreateClient(clientData);
    if (res.ok && res.client) {
      setClients((prev) => [res.client, ...prev]);
    }
    loadAllData();
  };

  const handleUpdateClient = async (id, updates) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id || c.refId === id ? { ...c, ...updates } : c))
    );
    await crmUpdateClient(id, updates);
    loadAllData();
  };

  const handleDeleteClient = async (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id && c.refId !== id));
    await crmDeleteClient(id);
    loadAllData();
  };

  // --------------------------------------------------------------------------
  // HANDLERS: GASTOS DEL MES
  // --------------------------------------------------------------------------
  const handleCreateExpense = async (expenseData) => {
    const res = await crmCreateExpense(expenseData);
    if (res.ok && res.expense) {
      setExpenses((prev) => [res.expense, ...prev]);
    }
    loadAllData();
  };

  const handleDeleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await crmDeleteExpense(id);
    loadAllData();
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
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
      currentUser={currentUser}
      leads={leads}
      clients={clients}
      customerProfiles={customerProfiles}
      campaigns={campaigns}
      expenses={expenses}
      onRefresh={loadAllData}
      refreshing={refreshing}
      onUpdateLead={handleUpdateLead}
      onCreateLead={handleCreateLead}
      onDeleteLead={handleDeleteLead}
      onUpdateClient={handleUpdateClient}
      onCreateClient={handleCreateClient}
      onDeleteClient={handleDeleteClient}
      onUpdateCustomerProfile={handleUpdateCustomerProfile}
      onCreateCustomerProfile={handleCreateCustomerProfile}
      onDeleteCustomerProfile={handleDeleteCustomerProfile}
      onAddCustomerFollowup={handleAddCustomerFollowup}
      onUpdateCampaign={handleUpdateCampaign}
      onCreateCampaign={handleCreateCampaign}
      onDeleteCampaign={handleDeleteCampaign}
      onCreateExpense={handleCreateExpense}
      onDeleteExpense={handleDeleteExpense}
      onConvertToClient={handleConvertToClient}
      onLogout={handleLogout}
      onNavigateLanding={onNavigateLanding}
    />
  );
}
