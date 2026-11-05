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
import CrmNewCompanyCampaignModal from "./CrmNewCompanyCampaignModal";
import CrmNewExpenseModal from "./CrmNewExpenseModal";
import CrmNewIncomeModal from "./CrmNewIncomeModal";
import CrmBackupModal from "./CrmBackupModal";
import CrmUsersModal from "./CrmUsersModal";
import CrmToast from "./CrmToast";

const ROLE_ALLOWED_TABS = {
  admin: ["dashboard", "commercial", "customer_service", "marketing", "clients", "meetings", "responses", "expenses"],
  atencion: ["customer_service", "clients", "meetings", "responses"],
  marketing: ["marketing", "clients", "customer_service", "expenses"],
};

export default function CrmDashboard({
  currentUser,
  leads = [],
  clients = [],
  customerProfiles = [],
  clientCampaigns = [],
  companyCampaigns = [],
  expenses = [],
  incomes = [],
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
  onUpdateClientCampaign,
  onCreateClientCampaign,
  onDeleteClientCampaign,
  onUpdateCompanyCampaign,
  onCreateCompanyCampaign,
  onDeleteCompanyCampaign,
  onCreateExpense,
  onDeleteExpense,
  onCreateIncome,
  onDeleteIncome,
  onConvertToClient,
  onLogout,
  onNavigateLanding,
}) {
  const role = currentUser?.role || "admin";

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
  const [isNewClientCampaignOpen, setIsNewClientCampaignOpen] = useState(false);
  const [isNewCompanyCampaignOpen, setIsNewCompanyCampaignOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isNewIncomeOpen, setIsNewIncomeOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  // Guard de pestañas por rol
  useEffect(() => {
    const allowed = ROLE_ALLOWED_TABS[role] || ROLE_ALLOWED_TABS.admin;
    if (!allowed.includes(activeTab)) {
      setActiveTab(getInitialTab(role));
    }
  }, [role, activeTab]);

  const showToast = (title, message = "", type = "success") => {
    setToast({ title, message, type });
  };

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

    // 2. PUBLICIDAD DE CLIENTES
    csv += "--- HOJA: PUBLICIDAD DE CLIENTES ---\n";
    csv += "ID,Campaña,Cliente,Plataforma,Objetivo,Pauta ARS,Honorarios ARS,Gastos Extras ARS,Total Cobrado ARS,Ganancia Neta ARS,Estado,Inicio,Fin\n";
    clientCampaigns.forEach((c) => {
      csv += `"${c.id || ""}","${(c.title || "").replace(/"/g, '""')}","${(c.clientName || "").replace(/"/g, '""')}","${(c.platform || "").replace(/"/g, '""')}","${(c.objective || "").replace(/"/g, '""')}","${c.adSpend || 0}","${c.agencyFee || 0}","${c.extraExpenses || 0}","${c.totalBilled || 0}","${c.netProfit || 0}","${c.status || "activa"}","${c.startDate || ""}","${c.endDate || ""}"\n`;
    });
    csv += "\n\n";

    // 3. PUBLICIDAD PROPIA (NEXO CREATIVE)
    csv += "--- HOJA: PUBLICIDAD PROPIA (NEXO CREATIVE) ---\n";
    csv += "ID,Nombre Campaña,Plataforma,Objetivo,Presupuesto Asignado ARS,Dinero Invertido ARS,Leads Captados,CPL ARS,Estado,Inicio,Fin\n";
    companyCampaigns.forEach((c) => {
      csv += `"${c.id || ""}","${(c.name || "").replace(/"/g, '""')}","${(c.platform || "").replace(/"/g, '""')}","${(c.objective || "").replace(/"/g, '""')}","${c.allocatedBudget || 0}","${c.spentAmount || 0}","${c.leadsAcquired || 0}","${c.cpl || 0}","${c.status || "activa"}","${c.startDate || ""}","${c.endDate || ""}"\n`;
    });
    csv += "\n\n";

    // 4. CLIENTES ACTIVOS
    csv += "--- HOJA: CLIENTES ACTIVOS ---\n";
    csv += "ID,Cliente / Negocio,Servicio Contratado,Responsable,Inicio,Próxima Renovación,Honorarios Mensuales ARS,Inversión Anuncios ARS,Estado,Contacto,Notas\n";
    clients.forEach((c) => {
      csv += `"${c.refId || c.id || ""}","${(c.clientName || "").replace(/"/g, '""')}","${(c.service || "").replace(/"/g, '""')}","${(c.responsible || "").replace(/"/g, '""')}","${c.startDate || ""}","${c.renewalDate || ""}","${c.feeARS || 0}","${c.adBudget || 0}","${c.status || "activo"}","${(c.contact || "").replace(/"/g, '""')}","${(c.notes || "").replace(/"/g, '""')}"\n`;
    });
    csv += "\n\n";

    // 5. CRM COMERCIAL
    csv += "--- HOJA: CRM COMERCIAL ---\n";
    csv += "ID,Fecha Ingreso,Nombre,Negocio,Rubro,WhatsApp,Redes,Origen,Servicio,Estado,Prioridad,Responsable,Próximo Contacto,Honorarios ARS,Probabilidad %,Ingreso Estimado ARS,Observaciones\n";
    leads.forEach((l) => {
      const fee = Number(l.feeARS) || 0;
      const prob = Number(l.probability) || 50;
      const est = Math.round(fee * (prob / 100));
      csv += `"${l.refId || l.id || ""}","${l.createdAt ? l.createdAt.slice(0, 10) : ""}","${(l.fullName || "").replace(/"/g, '""')}","${(l.businessName || "").replace(/"/g, '""')}","${(l.rubro || "").replace(/"/g, '""')}","${(l.phone || "").replace(/"/g, '""')}","${(l.socials || "").replace(/"/g, '""')}","${(l.origin || "").replace(/"/g, '""')}","${(l.service || "").replace(/"/g, '""')}","${l.status || "nuevo"}","${l.priority || "media"}","${(l.responsible || "").replace(/"/g, '""')}","${l.nextContactDate || ""}","${fee}","${prob}%","${est}","${(l.notes || "").replace(/"/g, '""')}"\n`;
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
      <CrmNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        leadsCount={leads.length}
        clientsCount={clients.length}
        customerProfilesCount={customerProfiles.length}
        clientCampaignsCount={clientCampaigns.length}
        companyCampaignsCount={companyCampaigns.length}
        meetingsCount={meetingsCount}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
        onOpenNewCustomerProfile={() => {
          setNewCustomerInitialLead(null);
          setIsNewCustomerOpen(true);
        }}
        onOpenNewClientCampaign={() => setIsNewClientCampaignOpen(true)}
        onOpenNewCompanyCampaign={() => setIsNewCompanyCampaignOpen(true)}
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        onOpenNewIncome={() => setIsNewIncomeOpen(true)}
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

      <div className="md:pl-64 flex flex-col flex-1 min-h-screen pt-14 md:pt-0">
        <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full pb-28 md:pb-12">
          {/* PESTAÑA: RESUMEN GENERAL (Admin) */}
          {activeTab === "dashboard" && role === "admin" && (
            <CrmDashboardView
              leads={leads}
              clients={clients}
              customerProfiles={customerProfiles}
              clientCampaigns={clientCampaigns}
              companyCampaigns={companyCampaigns}
              expenses={expenses}
              incomes={incomes}
              onNavigateTab={setActiveTab}
              onOpenNewLead={() => setIsNewLeadOpen(true)}
              onOpenNewCustomer={() => {
                setNewCustomerInitialLead(null);
                setIsNewCustomerOpen(true);
              }}
              onOpenNewClientCampaign={() => setIsNewClientCampaignOpen(true)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onOpenNewIncome={() => setIsNewIncomeOpen(true)}
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
              clientCampaigns={clientCampaigns}
              companyCampaigns={companyCampaigns}
              expenses={expenses}
              incomes={incomes}
              customerProfiles={customerProfiles}
              clients={clients}
              currentUser={currentUser}
              onUpdateClientCampaign={async (id, updates) => {
                await onUpdateClientCampaign(id, updates);
                showToast("Campaña de cliente actualizada", "Los cambios fueron guardados.");
              }}
              onDeleteClientCampaign={async (id) => {
                await onDeleteClientCampaign(id);
                showToast("Campaña eliminada", "La campaña de cliente fue retirada.");
              }}
              onOpenNewClientCampaign={() => setIsNewClientCampaignOpen(true)}
              onUpdateCompanyCampaign={async (id, updates) => {
                await onUpdateCompanyCampaign(id, updates);
                showToast("Campaña propia actualizada", "Se registraron los cambios de publicidad propia.");
              }}
              onDeleteCompanyCampaign={async (id) => {
                await onDeleteCompanyCampaign(id);
                showToast("Campaña propia eliminada", "La campaña interna fue retirada.");
              }}
              onOpenNewCompanyCampaign={() => setIsNewCompanyCampaignOpen(true)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onDeleteExpense={async (id) => {
                await onDeleteExpense(id);
                showToast("Gasto eliminado", "El gasto operativo fue eliminado.");
              }}
              onOpenNewIncome={() => setIsNewIncomeOpen(true)}
              onDeleteIncome={async (id) => {
                await onDeleteIncome(id);
                showToast("Ganancia eliminada", "El registro de ganancia fue eliminado.");
              }}
              onViewCustomerDetail={() => {
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

          {/* PESTAÑA: GANANCIAS & GASTOS (Admin y Marketing) */}
          {activeTab === "expenses" && (role === "admin" || role === "marketing") && (
            <CrmExpensesView
              expenses={expenses}
              incomes={incomes}
              onDeleteExpense={async (id) => {
                await onDeleteExpense(id);
                showToast("Gasto eliminado", "Se eliminó el egreso contable.");
              }}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onDeleteIncome={async (id) => {
                await onDeleteIncome(id);
                showToast("Ganancia eliminada", "Se eliminó el registro de ganancia.");
              }}
              onOpenNewIncome={() => setIsNewIncomeOpen(true)}
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

      {/* Modal Campaña de Cliente */}
      <CrmNewCampaignModal
        isOpen={isNewClientCampaignOpen}
        onClose={() => setIsNewClientCampaignOpen(false)}
        onCreateCampaign={async (data) => {
          await onCreateClientCampaign(data);
          showToast("Campaña de cliente creada", "Se configuró la pauta y honorarios con éxito.");
        }}
        customerProfiles={customerProfiles}
        clients={clients}
      />

      {/* Modal Campaña Propia de la Empresa */}
      <CrmNewCompanyCampaignModal
        isOpen={isNewCompanyCampaignOpen}
        onClose={() => setIsNewCompanyCampaignOpen(false)}
        onCreateCampaign={async (data) => {
          await onCreateCompanyCampaign(data);
          showToast("Campaña propia creada", "Se registró la inversión publicitaria de la empresa.");
        }}
      />

      {/* Modal Gastos y Ganancias (Admin y Marketing) */}
      {(role === "admin" || role === "marketing") && (
        <>
          <CrmNewExpenseModal
            isOpen={isNewExpenseOpen}
            onClose={() => setIsNewExpenseOpen(false)}
            onCreateExpense={async (data) => {
              await onCreateExpense(data);
              showToast("Gasto registrado", "El egreso operativo fue registrado.");
            }}
          />
          <CrmNewIncomeModal
            isOpen={isNewIncomeOpen}
            onClose={() => setIsNewIncomeOpen(false)}
            onCreateIncome={async (data) => {
              await onCreateIncome(data);
              showToast("Ganancia registrada", "El ingreso fue registrado correctamente.");
            }}
          />
        </>
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

      <CrmToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
