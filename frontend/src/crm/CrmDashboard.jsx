import React, { useState } from "react";
import CrmNavbar from "./CrmNavbar";
import CrmDashboardView from "./CrmDashboardView";
import CrmCommercialView from "./CrmCommercialView";
import CrmCustomerServiceView from "./CrmCustomerServiceView";
import CrmClientsView from "./CrmClientsView";
import CrmExpensesView from "./CrmExpensesView";
import CrmResponsesView from "./CrmResponsesView";
import CrmMeetingsView from "./CrmMeetingsView";
import CrmNewLeadModal from "./CrmNewLeadModal";
import CrmNewClientModal from "./CrmNewClientModal";
import CrmNewCustomerModal from "./CrmNewCustomerModal";
import CrmNewExpenseModal from "./CrmNewExpenseModal";
import CrmBackupModal from "./CrmBackupModal";

export default function CrmDashboard({
  leads = [],
  clients = [],
  customerProfiles = [],
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
  onCreateExpense,
  onDeleteExpense,
  onConvertToClient,
  onLogout,
  onNavigateLanding,
}) {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "commercial" | "customer_service" | "clients" | "meetings" | "responses" | "expenses"
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustomerInitialLead, setNewCustomerInitialLead] = useState(null);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Active meetings count
  const meetingsCount = leads.filter(
    (l) => (l.service === "Reunión Gratuita 20 min" || l.meetingDate) && l.status === "reunion_agendada"
  ).length;

  const handleOpenNewCustomerFromLead = (lead) => {
    setNewCustomerInitialLead(lead);
    setIsNewCustomerOpen(true);
  };

  const exportAllCsv = () => {
    // Generate comprehensive CSV matching the Excel sheets
    let csv = "\uFEFF"; // UTF-8 BOM for Excel compatibility

    // 1. ATENCIÓN AL PÚBLICO (FICHAS)
    csv += "--- HOJA: ATENCIÓN AL PÚBLICO (FICHAS) ---\n";
    csv += "ID,Nombre,Negocio,Teléfono,Email,Ciudad,Estado,Plan,Honorarios ARS,Publicidad,Pauta ARS,Último Contacto,Próxima Acción,Fecha Próxima\n";
    customerProfiles.forEach((p) => {
      csv += `"${p.refId || p.id || ""}","${(p.fullName || "").replace(/"/g, '""')}","${(p.businessName || "").replace(/"/g, '""')}","${(p.phone || "").replace(/"/g, '""')}","${(p.email || "").replace(/"/g, '""')}","${(p.city || "").replace(/"/g, '""')}","${p.status || "nuevo"}","${(p.planName || "").replace(/"/g, '""')}","${p.planPrice || 0}","${(p.adStrategy || "").replace(/"/g, '""')}","${p.adBudget || 0}","${p.lastContactDate || ""}","${(p.nextActionDescription || "").replace(/"/g, '""')}","${p.nextActionDate || ""}"\n`;
    });
    csv += "\n\n";

    // 2. CLIENTES ACTIVOS
    csv += "--- HOJA: CLIENTES ACTIVOS ---\n";
    csv += "ID,Cliente / Negocio,Servicio Contratado,Responsable,Inicio,Próxima Renovación,Honorarios Mensuales ARS,Inversión Anuncios ARS,Estado,Contacto,Notas\n";
    clients.forEach((c) => {
      csv += `"${c.refId || c.id || ""}","${(c.clientName || "").replace(/"/g, '""')}","${(c.service || "").replace(/"/g, '""')}","${(c.responsible || "").replace(/"/g, '""')}","${c.startDate || ""}","${c.renewalDate || ""}","${c.feeARS || 0}","${c.adBudget || 0}","${c.status || "activo"}","${(c.contact || "").replace(/"/g, '""')}","${(c.notes || "").replace(/"/g, '""')}"\n`;
    });
    csv += "\n\n";

    // 3. CRM COMERCIAL
    csv += "--- HOJA: CRM COMERCIAL ---\n";
    csv += "ID,Fecha Ingreso,Nombre,Negocio,Rubro,WhatsApp,Redes,Origen,Servicio,Estado,Prioridad,Responsable,Próximo Contacto,Honorarios ARS,Probabilidad %,Ingreso Estimado ARS,Observaciones\n";
    leads.forEach((l) => {
      const fee = Number(l.feeARS) || 0;
      const prob = Number(l.probability) || 50;
      const est = Math.round(fee * (prob / 100));
      csv += `"${l.refId || l.id || ""}","${l.createdAt ? l.createdAt.slice(0, 10) : ""}","${(l.fullName || "").replace(/"/g, '""')}","${(l.businessName || "").replace(/"/g, '""')}","${(l.rubro || "").replace(/"/g, '""')}","${(l.phone || "").replace(/"/g, '""')}","${(l.socials || "").replace(/"/g, '""')}","${(l.origin || "").replace(/"/g, '""')}","${(l.service || "").replace(/"/g, '""')}","${l.status || "nuevo"}","${l.priority || "media"}","${(l.responsible || "").replace(/"/g, '""')}","${l.nextContactDate || ""}","${fee}","${prob}%","${est}","${(l.notes || "").replace(/"/g, '""')}"\n`;
    });
    csv += "\n\n";

    // 4. GASTOS DEL MES
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
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col relative select-none">
      {/* Barra de Navegación (Desktop superior + Mobile inferior con 'Más') */}
      <CrmNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        leadsCount={leads.length}
        clientsCount={clients.length}
        customerProfilesCount={customerProfiles.length}
        meetingsCount={meetingsCount}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
        onOpenNewCustomerProfile={() => {
          setNewCustomerInitialLead(null);
          setIsNewCustomerOpen(true);
        }}
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        onOpenBackups={() => setIsBackupModalOpen(true)}
        onExportCsv={exportAllCsv}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onLogout={onLogout}
        onNavigateLanding={onNavigateLanding}
      />

      {/* Contenido Principal con Offset de Barra Lateral en Desktop y Espaciado en Celular */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen pt-14 md:pt-0">
        <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full pb-28 md:pb-12">
          {activeTab === "dashboard" && (
            <CrmDashboardView
              leads={leads}
              clients={clients}
              customerProfiles={customerProfiles}
              expenses={expenses}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === "commercial" && (
            <CrmCommercialView
              leads={leads}
              onUpdateLead={onUpdateLead}
              onDeleteLead={onDeleteLead}
              onConvertToClient={onConvertToClient}
              onConvertToCustomerProfile={handleOpenNewCustomerFromLead}
              onOpenNewLead={() => setIsNewLeadOpen(true)}
            />
          )}

          {activeTab === "customer_service" && (
            <CrmCustomerServiceView
              customerProfiles={customerProfiles}
              onUpdateProfile={onUpdateCustomerProfile}
              onDeleteProfile={onDeleteCustomerProfile}
              onAddFollowup={onAddCustomerFollowup}
              onOpenNewProfile={() => {
                setNewCustomerInitialLead(null);
                setIsNewCustomerOpen(true);
              }}
            />
          )}

          {activeTab === "clients" && (
            <CrmClientsView
              clients={clients}
              onUpdateClient={onUpdateClient}
              onDeleteClient={onDeleteClient}
              onOpenNewClient={() => setIsNewClientOpen(true)}
            />
          )}

          {activeTab === "meetings" && (
            <CrmMeetingsView
              leads={leads}
              onUpdateLead={onUpdateLead}
            />
          )}

          {activeTab === "responses" && (
            <CrmResponsesView
              leads={leads}
              onUpdateLead={onUpdateLead}
              onDeleteLead={onDeleteLead}
              onConvertToCustomerProfile={handleOpenNewCustomerFromLead}
              onNavigateCommercial={() => setActiveTab("commercial")}
            />
          )}

          {activeTab === "expenses" && (
            <CrmExpensesView
              expenses={expenses}
              onDeleteExpense={onDeleteExpense}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modales de Creación y Backups */}
      <CrmNewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onCreateLead={onCreateLead}
      />

      <CrmNewCustomerModal
        isOpen={isNewCustomerOpen}
        onClose={() => {
          setIsNewCustomerOpen(false);
          setNewCustomerInitialLead(null);
        }}
        onCreateCustomer={onCreateCustomerProfile}
        existingProfiles={customerProfiles}
        initialLeadData={newCustomerInitialLead}
      />

      <CrmNewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onCreateClient={onCreateClient}
      />

      <CrmNewExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onCreateExpense={onCreateExpense}
      />

      <CrmBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRefreshData={onRefresh}
      />
    </div>
  );
}
