import React, { useState } from "react";
import CrmNavbar from "./CrmNavbar";
import CrmDashboardView from "./CrmDashboardView";
import CrmCommercialView from "./CrmCommercialView";
import CrmClientsView from "./CrmClientsView";
import CrmExpensesView from "./CrmExpensesView";
import CrmResponsesView from "./CrmResponsesView";
import CrmMeetingsView from "./CrmMeetingsView";
import CrmNewLeadModal from "./CrmNewLeadModal";
import CrmNewClientModal from "./CrmNewClientModal";
import CrmNewExpenseModal from "./CrmNewExpenseModal";

export default function CrmDashboard({
  leads = [],
  clients = [],
  expenses = [],
  onRefresh,
  refreshing = false,
  onUpdateLead,
  onCreateLead,
  onDeleteLead,
  onUpdateClient,
  onCreateClient,
  onDeleteClient,
  onCreateExpense,
  onDeleteExpense,
  onConvertToClient,
  onLogout,
  onNavigateLanding,
}) {
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "commercial" | "clients" | "meetings" | "responses" | "expenses"
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);

  // Active meetings count
  const meetingsCount = leads.filter(
    (l) => (l.service === "Reunión Gratuita 20 min" || l.meetingDate) && l.status === "reunion_agendada"
  ).length;

  const exportAllCsv = () => {
    // Generate comprehensive CSV matching the Excel sheets
    let csv = "\uFEFF"; // UTF-8 BOM for Excel compatibility

    // 1. CLIENTES ACTIVOS
    csv += "--- HOJA: CLIENTES ACTIVOS ---\n";
    csv += "ID,Cliente / Negocio,Servicio Contratado,Responsable,Inicio,Próxima Renovación,Honorarios Mensuales ARS,Inversión Anuncios ARS,Estado,Contacto,Notas\n";
    clients.forEach((c) => {
      csv += `"${c.refId || c.id || ""}","${(c.clientName || "").replace(/"/g, '""')}","${(c.service || "").replace(/"/g, '""')}","${(c.responsible || "").replace(/"/g, '""')}","${c.startDate || ""}","${c.renewalDate || ""}","${c.feeARS || 0}","${c.adBudget || 0}","${c.status || "activo"}","${(c.contact || "").replace(/"/g, '""')}","${(c.notes || "").replace(/"/g, '""')}"\n`;
    });
    csv += "\n\n";

    // 2. CRM COMERCIAL
    csv += "--- HOJA: CRM COMERCIAL ---\n";
    csv += "ID,Fecha Ingreso,Nombre,Negocio,Rubro,WhatsApp,Redes,Origen,Servicio,Estado,Prioridad,Responsable,Próximo Contacto,Honorarios ARS,Probabilidad %,Ingreso Estimado ARS,Observaciones\n";
    leads.forEach((l) => {
      const fee = Number(l.feeARS) || 0;
      const prob = Number(l.probability) || 50;
      const est = Math.round(fee * (prob / 100));
      csv += `"${l.refId || l.id || ""}","${l.createdAt ? l.createdAt.slice(0, 10) : ""}","${(l.fullName || "").replace(/"/g, '""')}","${(l.businessName || "").replace(/"/g, '""')}","${(l.rubro || "").replace(/"/g, '""')}","${(l.phone || "").replace(/"/g, '""')}","${(l.socials || "").replace(/"/g, '""')}","${(l.origin || "").replace(/"/g, '""')}","${(l.service || "").replace(/"/g, '""')}","${l.status || "nuevo"}","${l.priority || "media"}","${(l.responsible || "").replace(/"/g, '""')}","${l.nextContactDate || ""}","${fee}","${prob}%","${est}","${(l.notes || "").replace(/"/g, '""')}"\n`;
    });
    csv += "\n\n";

    // 3. GASTOS DEL MES
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
        meetingsCount={meetingsCount}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        onExportCsv={exportAllCsv}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onLogout={onLogout}
        onNavigateLanding={onNavigateLanding}
      />

      {/* Contenido Principal con Espaciado para Celular */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full pb-24 md:pb-12">
        {activeTab === "dashboard" && (
          <CrmDashboardView
            leads={leads}
            clients={clients}
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
            onOpenNewLead={() => setIsNewLeadOpen(true)}
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

      {/* Modales de Creación */}
      <CrmNewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onCreateLead={onCreateLead}
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
    </div>
  );
}
