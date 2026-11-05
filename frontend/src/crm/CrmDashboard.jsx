import React, { useState, useEffect } from "react";
import CrmNavbar from "./CrmNavbar";
import CrmDashboardView from "./CrmDashboardView";
import CrmCommercialView from "./CrmCommercialView";
import CrmCustomerServiceView from "./CrmCustomerServiceView";
import CrmMarketingView from "./CrmMarketingView";
import CrmClientsView from "./CrmClientsView";
import CrmExpensesView from "./CrmExpensesView";
import CrmResponsesView from "./CrmResponsesView";
import CrmMeetingsView from "./CrmMeetingsView";
import CrmNewLeadModal from "./CrmNewLeadModal";
import CrmNewClientModal from "./CrmNewClientModal";
import CrmNewCustomerModal from "./CrmNewCustomerModal";
import CrmNewCampaignModal from "./CrmNewCampaignModal";
import CrmNewExpenseModal from "./CrmNewExpenseModal";
import CrmBackupModal from "./CrmBackupModal";
import CrmUsersModal from "./CrmUsersModal";
import CrmToast from "./CrmToast";

const ROLE_ALLOWED_TABS = {
  admin: ["dashboard", "commercial", "customer_service", "marketing", "clients", "meetings", "responses", "expenses"],
  atencion: ["customer_service", "clients", "meetings", "responses"],
  marketing: ["marketing", "clients", "customer_service"],
};

export default function CrmDashboard({
  currentUser,
  leads = [],
  clients = [],
  customerProfiles = [],
  campaigns = [],
  expenses = [],
  onRefresh,
  refreshing = false,
  onUpdateLead,
  onCreateLead,
  onDeleteLead,
  onUpdateClient,
  onCreateClient,
  onDeleteClient,
  onUpdateCustomerProfile,
  onCreateCustomerProfile,
  onDeleteCustomerProfile,
  onAddCustomerFollowup,
  onUpdateCampaign,
  onCreateCampaign,
  onDeleteCampaign,
  onCreateExpense,
  onDeleteExpense,
  onConvertToClient,
  onLogout,
  onNavigateLanding,
}) {
  const role = currentUser?.role || "admin";

  // Tab inicial según el rol
  const getInitialTab = (r) => {
    if (r === "atencion") return "customer_service";
    if (r === "marketing") return "marketing";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab(role));
  const [toast, setToast] = useState(null);

  // Modales
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustomerInitialLead, setNewCustomerInitialLead] = useState(null);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  // Guard de pestañas por rol: si el rol no tiene permitido ver la pestaña activa, redirigir a su pestaña default
  useEffect(() => {
    const allowed = ROLE_ALLOWED_TABS[role] || ROLE_ALLOWED_TABS.admin;
    if (!allowed.includes(activeTab)) {
      setActiveTab(getInitialTab(role));
    }
  }, [role, activeTab]);

  const showToast = (title, message = "", type = "success") => {
    setToast({ title, message, type });
  };

  // Reuniones activas
  const meetingsCount = leads.filter(
    (l) => (l.service === "Reunión Gratuita 20 min" || l.meetingDate) && l.status === "reunion_agendada"
  ).length;

  const handleOpenNewCustomerFromLead = (lead) => {
    setNewCustomerInitialLead(lead);
    setIsNewCustomerOpen(true);
  };

  const exportAllCsv = () => {
    let csv = "\uFEFF"; // UTF-8 BOM

    // 1. ATENCIÓN AL PÚBLICO
    csv += "--- HOJA: ATENCIÓN AL PÚBLICO (FICHAS) ---\n";
    csv += "ID,Nombre,Negocio,Teléfono,Email,Ciudad,Estado,Plan,Honorarios ARS,Publicidad,Pauta ARS,Último Contacto,Próxima Acción,Fecha Próxima\n";
    customerProfiles.forEach((p) => {
      csv += `"${p.refId || p.id || ""}","${(p.fullName || "").replace(/"/g, '""')}","${(p.businessName || "").replace(/"/g, '""')}","${(p.phone || "").replace(/"/g, '""')}","${(p.email || "").replace(/"/g, '""')}","${(p.city || "").replace(/"/g, '""')}","${p.status || "nuevo"}","${(p.planName || "").replace(/"/g, '""')}","${p.planPrice || 0}","${(p.adStrategy || "").replace(/"/g, '""')}","${p.adBudget || 0}","${p.lastContactDate || ""}","${(p.nextActionDescription || "").replace(/"/g, '""')}","${p.nextActionDate || ""}"\n`;
    });
    csv += "\n\n";

    // 2. MARKETING & CAMPAÑAS
    csv += "--- HOJA: MARKETING & CAMPAÑAS ---\n";
    csv += "ID,Título,Cliente,Plataforma,Objetivo,Pauta ARS,Estado,Fecha Creación\n";
    campaigns.forEach((c) => {
      csv += `"${c.id || ""}","${(c.title || "").replace(/"/g, '""')}","${(c.clientName || "").replace(/"/g, '""')}","${(c.platform || "").replace(/"/g, '""')}","${(c.objective || "").replace(/"/g, '""')}","${c.budgetARS || 0}","${c.status || "activa"}","${c.createdAt || ""}"\n`;
    });
    csv += "\n\n";

    // 3. CLIENTES ACTIVOS
    csv += "--- HOJA: CLIENTES ACTIVOS ---\n";
    csv += "ID,Cliente / Negocio,Servicio Contratado,Responsable,Inicio,Próxima Renovación,Honorarios Mensuales ARS,Inversión Anuncios ARS,Estado,Contacto,Notas\n";
    clients.forEach((c) => {
      csv += `"${c.refId || c.id || ""}","${(c.clientName || "").replace(/"/g, '""')}","${(c.service || "").replace(/"/g, '""')}","${(c.responsible || "").replace(/"/g, '""')}","${c.startDate || ""}","${c.renewalDate || ""}","${c.feeARS || 0}","${c.adBudget || 0}","${c.status || "activo"}","${(c.contact || "").replace(/"/g, '""')}","${(c.notes || "").replace(/"/g, '""')}"\n`;
    });
    csv += "\n\n";

    // 4. CRM COMERCIAL
    csv += "--- HOJA: CRM COMERCIAL ---\n";
    csv += "ID,Fecha Ingreso,Nombre,Negocio,Rubro,WhatsApp,Redes,Origen,Servicio,Estado,Prioridad,Responsable,Próximo Contacto,Honorarios ARS,Probabilidad %,Ingreso Estimado ARS,Observaciones\n";
    leads.forEach((l) => {
      const fee = Number(l.feeARS) || 0;
      const prob = Number(l.probability) || 50;
      const est = Math.round(fee * (prob / 100));
      csv += `"${l.refId || l.id || ""}","${l.createdAt ? l.createdAt.slice(0, 10) : ""}","${(l.fullName || "").replace(/"/g, '""')}","${(l.businessName || "").replace(/"/g, '""')}","${(l.rubro || "").replace(/"/g, '""')}","${(l.phone || "").replace(/"/g, '""')}","${(l.socials || "").replace(/"/g, '""')}","${(l.origin || "").replace(/"/g, '""')}","${(l.service || "").replace(/"/g, '""')}","${l.status || "nuevo"}","${l.priority || "media"}","${(l.responsible || "").replace(/"/g, '""')}","${l.nextContactDate || ""}","${fee}","${prob}%","${est}","${(l.notes || "").replace(/"/g, '""')}"\n`;
    });
    csv += "\n\n";

    // 5. GASTOS DEL MES
    csv += "--- HOJA: GASTOS DEL MES ---\n";
    csv += "ID,Fecha,Categoría,Detalle,Monto ARS\n";
    expenses.forEach((e) => {
      csv += `"${e.id || ""}","${e.date || ""}","${(e.category || "").replace(/"/g, '""')}","${(e.description || "").replace(/"/g, '""')}","${e.amount || 0}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NEXO_Creative_CRM_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Exportación completada", "El archivo CSV se descargó correctamente.");
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col relative select-none">
      {/* Barra de Navegación Lateral en Desktop y Cabecera/Bottom en Móvil */}
      <CrmNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        leadsCount={leads.length}
        clientsCount={clients.length}
        customerProfilesCount={customerProfiles.length}
        campaignsCount={campaigns.length}
        meetingsCount={meetingsCount}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
        onOpenNewCustomerProfile={() => {
          setNewCustomerInitialLead(null);
          setIsNewCustomerOpen(true);
        }}
        onOpenNewCampaign={() => setIsNewCampaignOpen(true)}
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        onOpenUsers={() => setIsUsersModalOpen(true)}
        onOpenBackups={() => setIsBackupModalOpen(true)}
        onExportCsv={exportAllCsv}
        onRefresh={() => {
          onRefresh?.();
          showToast("Datos actualizados", "Se sincronizó la información con la base de datos.");
        }}
        refreshing={refreshing}
        onLogout={onLogout}
        onNavigateLanding={onNavigateLanding}
      />

      {/* Contenido Principal con Offset Lateral */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen pt-14 md:pt-0">
        <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full pb-28 md:pb-12">
          {/* PESTAÑA: DASHBOARD EJECUTIVO (Solo Admin) */}
          {activeTab === "dashboard" && role === "admin" && (
            <CrmDashboardView
              leads={leads}
              clients={clients}
              customerProfiles={customerProfiles}
              campaigns={campaigns}
              expenses={expenses}
              onNavigateTab={setActiveTab}
              onOpenNewLead={() => setIsNewLeadOpen(true)}
              onOpenNewCustomer={() => {
                setNewCustomerInitialLead(null);
                setIsNewCustomerOpen(true);
              }}
              onOpenNewCampaign={() => setIsNewCampaignOpen(true)}
            />
          )}

          {/* PESTAÑA: PIPELINE COMERCIAL (Admin) */}
          {activeTab === "commercial" && role === "admin" && (
            <CrmCommercialView
              leads={leads}
              onUpdateLead={async (id, updates, notes) => {
                await onUpdateLead(id, updates, notes);
                showToast("Lead actualizado", "Los cambios comerciales se guardaron correctamente.");
              }}
              onDeleteLead={async (id) => {
                await onDeleteLead(id);
                showToast("Lead eliminado", "El registro fue retirado del pipeline.");
              }}
              onConvertToClient={async (lead) => {
                await onConvertToClient(lead);
                showToast("Oportunidad convertida", "Se creó la ficha de cliente activo.");
              }}
              onConvertToCustomerProfile={handleOpenNewCustomerFromLead}
              onOpenNewLead={() => setIsNewLeadOpen(true)}
            />
          )}

          {/* PESTAÑA: ATENCIÓN AL PÚBLICO (Admin, Atención y Marketing para contexto) */}
          {activeTab === "customer_service" && (
            <CrmCustomerServiceView
              customerProfiles={customerProfiles}
              onUpdateProfile={async (id, updates, desc) => {
                const ok = await onUpdateCustomerProfile(id, updates, desc);
                if (ok) showToast("Ficha guardada", "La información de atención fue actualizada.");
                return ok;
              }}
              onDeleteProfile={async (id) => {
                if (role !== "admin") return;
                await onDeleteCustomerProfile(id);
                showToast("Ficha eliminada", "Se removió la ficha del cliente.");
              }}
              onAddFollowup={async (id, followup) => {
                await onAddCustomerFollowup(id, followup);
                showToast("Seguimiento registrado", "Se añadió la nota al historial.");
              }}
              onOpenNewProfile={() => {
                setNewCustomerInitialLead(null);
                setIsNewCustomerOpen(true);
              }}
            />
          )}

          {/* PESTAÑA: MARKETING & PUBLICIDAD (Admin y Marketing) */}
          {activeTab === "marketing" && (role === "admin" || role === "marketing") && (
            <CrmMarketingView
              campaigns={campaigns}
              customerProfiles={customerProfiles}
              clients={clients}
              onUpdateCampaign={async (id, updates) => {
                await onUpdateCampaign(id, updates);
                showToast("Campaña actualizada", "Los cambios en la campaña fueron guardados.");
              }}
              onDeleteCampaign={async (id) => {
                await onDeleteCampaign(id);
                showToast("Campaña eliminada", "La campaña publicitaria fue eliminada.");
              }}
              onOpenNewCampaign={() => setIsNewCampaignOpen(true)}
              onViewCustomerDetail={(profile) => {
                setActiveTab("customer_service");
              }}
            />
          )}

          {/* PESTAÑA: CLIENTES ACTIVOS (Admin, Atención y Marketing) */}
          {activeTab === "clients" && (
            <CrmClientsView
              clients={clients}
              onUpdateClient={async (id, updates) => {
                await onUpdateClient(id, updates);
                showToast("Cliente actualizado", "Los datos del servicio fueron guardados.");
              }}
              onDeleteClient={async (id) => {
                if (role !== "admin") return;
                await onDeleteClient(id);
                showToast("Cliente eliminado", "El cliente fue retirado de la lista activa.");
              }}
              onOpenNewClient={() => setIsNewClientOpen(true)}
            />
          )}

          {/* PESTAÑA: AGENDA REUNIONES 20 MIN (Admin y Atención) */}
          {activeTab === "meetings" && (role === "admin" || role === "atencion") && (
            <CrmMeetingsView
              leads={leads}
              onUpdateLead={async (id, updates, notes) => {
                await onUpdateLead(id, updates, notes);
                showToast("Reunión actualizada", "Se actualizaron los datos del encuentro.");
              }}
            />
          )}

          {/* PESTAÑA: FORMULARIOS WEB (Admin y Atención) */}
          {activeTab === "responses" && (role === "admin" || role === "atencion") && (
            <CrmResponsesView
              leads={leads}
              onUpdateLead={async (id, updates, notes) => {
                await onUpdateLead(id, updates, notes);
                showToast("Consulta actualizada", "Se guardó el estado del formulario.");
              }}
              onDeleteLead={async (id) => {
                if (role !== "admin") return;
                await onDeleteLead(id);
                showToast("Consulta eliminada", "Se eliminó el formulario.");
              }}
              onConvertToCustomerProfile={handleOpenNewCustomerFromLead}
              onNavigateCommercial={() => {
                if (role === "admin") setActiveTab("commercial");
              }}
            />
          )}

          {/* PESTAÑA: GASTOS DEL MES (Solo Admin) */}
          {activeTab === "expenses" && role === "admin" && (
            <CrmExpensesView
              expenses={expenses}
              onDeleteExpense={async (id) => {
                await onDeleteExpense(id);
                showToast("Gasto eliminado", "Se eliminó el egreso contable.");
              }}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modales del CRM */}
      <CrmNewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onCreateLead={async (data) => {
          await onCreateLead(data);
          showToast("Lead creado", "La oportunidad comercial fue agregada.");
        }}
      />

      <CrmNewCustomerModal
        isOpen={isNewCustomerOpen}
        onClose={() => {
          setIsNewCustomerOpen(false);
          setNewCustomerInitialLead(null);
        }}
        onCreateCustomer={async (data) => {
          const ok = await onCreateCustomerProfile(data);
          if (ok) showToast("Ficha creada", "El cliente fue registrado en atención al público.");
          return ok;
        }}
        existingProfiles={customerProfiles}
        initialLeadData={newCustomerInitialLead}
      />

      <CrmNewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onCreateClient={async (data) => {
          await onCreateClient(data);
          showToast("Cliente registrado", "Se añadió a la lista de clientes activos.");
        }}
      />

      <CrmNewCampaignModal
        isOpen={isNewCampaignOpen}
        onClose={() => setIsNewCampaignOpen(false)}
        onCreateCampaign={async (data) => {
          await onCreateCampaign(data);
          showToast("Campaña creada", "La campaña de marketing se configuró con éxito.");
        }}
        customerProfiles={customerProfiles}
        clients={clients}
      />

      {role === "admin" && (
        <CrmNewExpenseModal
          isOpen={isNewExpenseOpen}
          onClose={() => setIsNewExpenseOpen(false)}
          onCreateExpense={async (data) => {
            await onCreateExpense(data);
            showToast("Gasto registrado", "El egreso fue asentado en la contabilidad.");
          }}
        />
      )}

      {role === "admin" && (
        <CrmBackupModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          onRefreshData={onRefresh}
        />
      )}

      {role === "admin" && (
        <CrmUsersModal
          isOpen={isUsersModalOpen}
          onClose={() => setIsUsersModalOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Notificación Toast no intrusiva */}
      <CrmToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
