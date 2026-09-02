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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {comisiones.length > 0 ? (
        comisiones.map((c, i) => {
          const idUnico = c.id_comisiones || c.id || i;
          const esActivo = esRegistroActivo(c.activo);

        return (
          <div
            key={idUnico}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
          >
            {/* CABECERA */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-400 font-bold">
                N° {c.nro_comision || "-"}
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

              {/* DOCENTE */}
              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <p>
                  <strong>Docente:</strong>{" "}
                  {obtenerNombreDocente(c.docente, usuarios)}
                </p>
              </div>

              {/* DÍA Y HORARIO */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Día y horario
                </h4>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">
                    {c.dia || "-"}
                  </p>

                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {formatearHora(c.hora_desde) || "--:--"} a{" "}
                    {formatearHora(c.hora_hasta) || "--:--"} hs
                  </p>
                </div>
              </div>

            {/* AULA */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mb-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Aula
              </h4>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-xs font-bold text-slate-700">
                  {c.aula || "-"}
                </span>
              </div>
            </div>

            {/* MODALIDAD / TIPO */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 mb-2">
                Modalidad / Tipo
              </h4>

              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    (c.presencial_virtual || "").toUpperCase() === "PRESENCIAL"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {c.presencial_virtual || "PRESENCIAL"}
                </span>

                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {c.clasico_ludico || "clásico"}
                </span>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
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

          </div>
        </div>
      );
    })
  ) : (
    <div className="col-span-full text-center py-8 text-slate-400 italic text-xs">
      No se encontraron comisiones registradas.
    </div>
  )}
</div>
  );
}
