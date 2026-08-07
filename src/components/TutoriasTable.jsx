import React from "react";
import { Pencil, Trash2, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { formatearHora, esRegistroActivo } from "../utils/academicoUtils";

export default function TutoriasTable({ tutorias, onEditar, onEliminar }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Día</th>
              <th className="py-3 px-4">Horario</th>
              <th className="py-3 px-4">Aula / Ubicación</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {tutorias.length > 0 ? (
              tutorias.map((t, i) => {
                const idUnico = t.id_tutorias || t.id || i;
                const esActivo = esRegistroActivo(t.activo);

                return (
                  <tr key={idUnico} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 font-bold">
                      #{t.id_tutorias || t.id || "-"}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {t.dia || "-"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatearHora(t.horario)} hs
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-700">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        {t.aula || "Sin aula"}
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
                          onClick={() => onEditar(t)}
                          title="Editar tutoría"
                          className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEliminar(t)}
                          title="Eliminar tutoría"
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
                  colSpan="6"
                  className="text-center py-8 text-slate-400 italic text-xs"
                >
                  No se encontraron horarios de tutoría registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
