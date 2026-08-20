import React from "react";
import { Loader2 } from "lucide-react";

export default function ConfirmarEliminarModal({
  abierto,
  tabActiva,
  item,
  onCancel,
  onConfirm,
  eliminando,
}) {
  if (!abierto || !item) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
        <h2 className="text-base font-black text-slate-800">
          ¿Eliminar {tabActiva === "comisiones" ? "Comisión" : "Tutoría"}?
        </h2>
        <p className="text-xs text-slate-500">
          ¿Estás seguro de que deseas eliminar{" "}
          <strong className="text-slate-800">
            {tabActiva === "comisiones"
              ? `la comisión N° ${item.nro_comision}`
              : `la tutoría del día ${item.dia} (${item.horario})`}
          </strong>
          ? Esta acción no se puede deshacer.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={eliminando}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {eliminando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
