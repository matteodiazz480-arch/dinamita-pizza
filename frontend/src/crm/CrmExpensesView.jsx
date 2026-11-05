import React, { useState, useMemo } from "react";
import { Plus, Trash2, Search } from "lucide-react";

function getCurrentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function CrmExpensesView({
  expenses = [],
  incomes = [],
  onDeleteExpense,
  onOpenNewExpense,
  onDeleteIncome,
  onOpenNewIncome,
}) {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "incomes" | "expenses"
  const [searchTerm, setSearchTerm] = useState("");

  const currentYearMonth = getCurrentYearMonth();

  const totalIncomesMonth = incomes
    .filter((i) => !i.date || (i.date || "").startsWith(currentYearMonth))
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  const totalExpensesMonth = expenses
    .filter((e) => !e.date || (e.date || "").startsWith(currentYearMonth))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const totalIncomesAll = incomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalExpensesAll = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netBalanceAll = totalIncomesAll - totalExpensesAll;

  // Unificar movimientos para vista consolidada
  const unifiedMovements = useMemo(() => {
    const incList = incomes.map((i) => ({
      ...i,
      type: "income",
      title: i.description || i.category || "Ingreso",
      subtitle: i.clientName ? `${i.category} · ${i.clientName}` : i.category || "Honorarios",
    }));
    const expList = expenses.map((e) => ({
      ...e,
      type: "expense",
      title: e.description || e.category || "Gasto",
      subtitle: e.category || "Operativo",
    }));

    const combined = [...incList, ...expList].sort(
      (a, b) =>
        new Date(b.date || b.createdAtIso || 0).getTime() -
        new Date(a.date || a.createdAtIso || 0).getTime()
    );

    return combined.filter((item) => {
      if (activeTab === "incomes" && item.type !== "income") return false;
      if (activeTab === "expenses" && item.type !== "expense") return false;

      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    });
  }, [incomes, expenses, activeTab, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Cabecera limpia con acciones directas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/8">
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Ganancias &amp; Gastos
        </h1>

        <div className="flex items-center gap-2">
          {onOpenNewIncome && (
            <button
              type="button"
              onClick={onOpenNewIncome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Registrar Ganancia</span>
            </button>
          )}

          {onOpenNewExpense && (
            <button
              type="button"
              onClick={onOpenNewExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Gasto</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Métricas planas con tabular-nums */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-[#141519] border border-white/8 rounded-xl p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
            Balance Registrado
          </span>
          <span
            className={`text-xl sm:text-2xl font-bold font-mono tabular-nums mt-1 block ${
              netBalanceAll >= 0 ? "text-[#22C55E]" : "text-red-400"
            }`}
          >
            ${netBalanceAll.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="bg-[#141519] border border-white/8 rounded-xl p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
            Ganancias del Mes ({currentYearMonth})
          </span>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums mt-1 block">
            ${totalIncomesMonth.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="bg-[#141519] border border-white/8 rounded-xl p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
            Gastos del Mes ({currentYearMonth})
          </span>
          <span className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums mt-1 block">
            ${totalExpensesMonth.toLocaleString("es-AR")}
          </span>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="grid grid-cols-3 w-full sm:w-auto gap-1 p-1 bg-[#141519] border border-white/8 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-[#16A34A] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Todos ({incomes.length + expenses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("incomes")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "incomes"
                ? "bg-[#16A34A] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Ganancias ({incomes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "expenses"
                ? "bg-[#16A34A] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Gastos ({expenses.length})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar concepto o cliente..."
            className="w-full bg-[#141519] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
          />
        </div>
      </div>

      {/* Tabla / Lista de Movimientos */}
      <div className="bg-[#141519] border border-white/8 rounded-xl overflow-hidden">
        {unifiedMovements.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No hay movimientos registrados en esta vista.
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {unifiedMovements.map((item) => {
              const isIncome = item.type === "income";
              return (
                <div
                  key={`${item.type}_${item.id}`}
                  className="px-4 py-3 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          isIncome ? "bg-[#22C55E]" : "bg-gray-500"
                        }`}
                      />
                      <span className="font-semibold text-white truncate">
                        {item.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 pl-3.5 mt-0.5">
                      <span className="font-mono tabular-nums">{item.date || "-"}</span>
                      <span> · {item.subtitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`font-mono font-bold text-sm tabular-nums ${
                        isIncome ? "text-[#22C55E]" : "text-white"
                      }`}
                    >
                      {isIncome ? "+" : "-"}${(Number(item.amount) || 0).toLocaleString("es-AR")}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (isIncome) {
                          if (window.confirm("¿Eliminar este registro de ganancia?")) {
                            onDeleteIncome?.(item.id);
                          }
                        } else {
                          if (window.confirm("¿Eliminar este registro de gasto?")) {
                            onDeleteExpense?.(item.id);
                          }
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
