import React from "react";
import {
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  obtenerNombreDocente,
  formatearHora,
  esRegistroActivo,
} from "../utils/academicoUtils";

export default function ComisionesTable({
  comisiones,
  usuarios,
  onEditar,
  onEliminar,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">N° Comisión</th>
              <th className="py-3 px-4">Docente</th>
              <th className="py-3 px-4">Día y Horario</th>
              <th className="py-3 px-4">Aula</th>
              <th className="py-3 px-4">Modalidad / Tipo</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {comisiones.length > 0 ? (
              comisiones.map((c, i) => {
                const idUnico = c.id_comisiones || c.id || i;
                const esActivo = esRegistroActivo(c.activo);

                return (
                  <tr key={idUnico} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-black text-slate-800">
                      N° {c.nro_comision || "-"}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {obtenerNombreDocente(c.docente, usuarios)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {c.dia || "-"}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {formatearHora(c.hora_desde) || "--:--"} a{" "}
                        {formatearHora(c.hora_hasta) || "--:--"} hs
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-700">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        {c.aula || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-1">
                      <span
                        className={`inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          (c.presencial_virtual || "").toUpperCase() ===
                          "PRESENCIAL"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {c.presencial_virtual || "PRESENCIAL"}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {c.clasico_ludico || "clásico"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {!esActivo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <XCircle className="w-3 h-3" /> Inactiva
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Activa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditar(c)}
                          title="Editar comisión"
                          className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEliminar(c)}
                          title="Eliminar comisión"
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-8 text-slate-400 italic text-xs"
                >
                  No se encontraron comisiones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
