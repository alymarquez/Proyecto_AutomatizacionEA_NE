import React from "react";
import { Pencil, Trash2, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { formatearHora, esRegistroActivo } from "../utils/academicoUtils";

export default function TutoriasTable({ tutorias, onEditar, onEliminar }) {
  return (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {tutorias.length > 0 ? (
      tutorias.map((t, i) => {
        const idUnico = t.id_tutorias || t.id || i;
        const esActivo = esRegistroActivo(t.activo);

        return (
          <div
            key={idUnico}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
          >
            {/* CABECERA */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-400 font-bold">
                #{t.id_tutorias || t.id || "-"}
              </span>

              {!esActivo ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                  <XCircle className="w-3 h-3" />
                  Inactiva
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" />
                  Activa
                </span>
              )}
            </div>

            {/* CONTENIDO */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

              {/* DÍA */}
              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <p className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">
                    Día:
                  </span>
                  <strong className="text-slate-800">
                    {t.dia || "-"}
                  </strong>
                </p>
              </div>

              {/* HORARIO */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 mb-2">
                  Horario
                </h4>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {formatearHora(t.horario) || "--:--"} hs
                  </span>
                </div>
              </div>

              {/* AULA / UBICACIÓN */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Aula / Ubicación
                </h4>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">
                    {t.aula || "Sin aula"}
                  </span>
                </div>
              </div>

              {/* ACCIONES */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
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

            </div>
          </div>
        );
      })
    ) : (
      <div className="col-span-full text-center py-8 text-slate-400 italic text-xs">
        No se encontraron horarios de tutoría registrados.
      </div>
    )}
  </div>
);
}