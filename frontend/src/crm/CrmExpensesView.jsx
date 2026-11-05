import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Wallet,
  Search,
  Filter,
} from "lucide-react";

function getCurrentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function CrmExpensesView({
  expenses = [],
  onDeleteExpense,
  onOpenNewExpense,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const currentYearMonth = getCurrentYearMonth();

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !searchTerm.trim() ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.category && e.category.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory =
        categoryFilter === "all" || e.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const totalCurrentMonth = expenses
    .filter((e) => !e.date || (e.date || "").startsWith(currentYearMonth))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const allTimeTotal = expenses.reduce(
    (acc, e) => acc + (Number(e.amount) || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* TARJETAS RESUMEN DE GASTOS                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#141519] border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Gastos del Mes ({currentYearMonth})
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1 block">
              ${totalCurrentMonth.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Total Histórico Registrado
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">
              ${allTimeTotal.toLocaleString("es-AR")}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              {expenses.length} registros totales
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenNewExpense}
            className="px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FILTROS Y BÚSQUEDA                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por detalle o categoría..."
            className="w-full bg-[#181a20] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#181a20]">Todas las categorías</option>
              <option value="Herramientas & Software" className="bg-[#181a20]">Herramientas &amp; Software</option>
              <option value="Infraestructura & Servidores" className="bg-[#181a20]">Infraestructura &amp; Servidores</option>
              <option value="Diseño & Creatividad" className="bg-[#181a20]">Diseño &amp; Creatividad</option>
              <option value="Publicidad Propia" className="bg-[#181a20]">Publicidad Propia</option>
              <option value="Freelancers & Equipo" className="bg-[#181a20]">Freelancers &amp; Equipo</option>
              <option value="Varios" className="bg-[#181a20]">Varios</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VISTA MÓVIL (TARJETAS: Sin desbordamiento)                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="md:hidden space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-[#141519] border border-white/10 rounded-2xl">
            No hay gastos registrados en esta categoría.
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-[#141519] border border-white/10 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full inline-block">
                  {exp.category}
                </span>
                <div className="font-bold text-sm text-white">{exp.description}</div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{exp.date || "Fecha actual"}</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-base font-black font-mono text-white">
                  ${(Number(exp.amount) || 0).toLocaleString("es-AR")}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("¿Eliminar este gasto?")) {
                      onDeleteExpense(exp.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VISTA ESCRITORIO (TABLA DE GASTOS)                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden md:block bg-[#141519] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#181a20] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Detalle / Proveedor</th>
                <th className="py-3 px-4">Monto (ARS)</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No se encontraron gastos registrados.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-400">
                      {exp.date || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-block">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      ${(Number(exp.amount) || 0).toLocaleString("es-AR")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("¿Eliminar este registro de gasto?")) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
