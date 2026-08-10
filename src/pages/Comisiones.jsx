import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import EditResponsablesComisiones from "../forms/EditResponsablesComisiones";
import { Users2, Calendar, MapPin, Clock, Edit3, Users, Mail, UserCheck } from "lucide-react";

// Función auxiliar para formatear la fecha cortando el timestamp ISO
function formatearFechaLegible(fechaRaw) {
  if (!fechaRaw) return "";
  
  // Si viene en formato ISO (ej: 2026-06-26T03:00:00.000Z)
  const fechaLimpia = String(fechaRaw).split("T")[0];
  const partes = fechaLimpia.split("-");
  
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }
  
  return fechaRaw;
}

function Comisiones() {
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);
  const [comisionSeleccionada, setComisionSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const { comisiones = [], eventos = [], usuarios = [], loading, API_URL, actualizarEventoLocal } = useApp();

  // filtra eventos de tipo "Comision"
  const eventosComisiones = useMemo(() => {
    return eventos.filter((e) => {
      const tipoLimpio = String(e.tipo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
      return tipoLimpio === "comision";
    });
  }, [eventos]);

  // extrae semanas únicas
  const semanas = useMemo(() => {
    const setSemanas = new Set(
      eventosComisiones
        .map((e) => parseInt(e.semana, 10))
        .filter((s) => !isNaN(s) && s > 0)
    );
    return Array.from(setSemanas).sort((a, b) => a - b);
  }, [eventosComisiones]);

  // ajustar semana por defecto si cambia la lista de semanas
  useEffect(() => {
    if (semanas.length > 0 && !semanas.includes(semanaSeleccionada)) {
      setSemanaSeleccionada(semanas[0]);
    }
  }, [semanas]);

  // mapear las comisiones de la semana seleccionada
  const comisionesFiltradas = useMemo(() => {
    return eventosComisiones
      .filter((item) => parseInt(item.semana, 10) === Number(semanaSeleccionada))
      .map((item) => {
        const info = comisiones.find(
          (t) => Number(t.id_comisiones || t.id) === Number(item.referencia_id)
        );

        const idsAsistentes = String(item.asistente_id || "")
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);

        const responsables = Array.from(
          new Set(
            idsAsistentes
              .map((id) => usuarios.find((u) => Number(u.id_usuarios || u.id) === Number(id))?.nombre)
              .filter(Boolean)
          )
        );

        const docente = usuarios.find(
          (u) => Number(u.id_usuarios || u.id) === Number(info?.docente)
        );

        const formatearHora = (horaRaw) => {
          if (!horaRaw) return "";

          const str = String(horaRaw).trim();

          // si ya es una hora simple (ej: "18:00" o "18:00:00")
          if (/^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(str)) {
            return str.substring(0, 5); // Retorna "18:00"
          }

          // si viene como timestamp ISO
          const fechaObj = new Date(str);
          if (!isNaN(fechaObj.getTime())) {
            return fechaObj.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          }

          // si es un texto plano tipo "18:00 hs", devuelve el string tal cual
          return str;
        };

        return {
          ...item,
          id_unico: item.id_calendario || item.id,
          fecha: formatearFechaLegible(item.fecha),
          semana: Number(item.semana),
          nro: info?.nro_comision || item.nro || "",
          aula: info?.aula || item.aula || "",
          dia: info?.dia || item.dia || "",
          hora:
            info?.hora_desde && info?.hora_hasta
              ? `${formatearHora(info.hora_desde)} - ${formatearHora(info.hora_hasta)}`
              : item.hora || "",
          docente: docente ? `${docente.apellido}, ${docente.nombre}` : "",
          mailDocente: docente?.email || "",
          responsables,
        };
      });
  }, [eventosComisiones, semanaSeleccionada, comisiones, usuarios]);

  const totalResponsables = useMemo(() => {
    return comisionesFiltradas.reduce((acc, t) => acc + t.responsables.length, 0);
  }, [comisionesFiltradas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando comisiones...</p>
      </div>
    );
  }

  const abrirEditor = (comision) => {
    setComisionSeleccionada(comision);
    setModalAbierto(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-xs">
            <Users2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Acompañamiento de Comisiones Presenciales
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5 block">
              Planificación y asignación de Estudiantes Asistentes por aula y semana
            </span>
          </div>
        </div>
      </div>

      {/* RESUMEN Y FILTRO */}
      <div className="bg-slate-100/50 rounded-2xl border border-slate-200/60 p-6 mb-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-center items-center bg-white p-4 rounded-xl border border-slate-200/60">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
              Semana seleccionada
            </label>
            <select
              value={semanaSeleccionada}
              onChange={(e) => setSemanaSeleccionada(Number(e.target.value))}
              className="w-full max-w-[200px] bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 font-bold tracking-tight outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {semanas.length === 0 ? (
                <option value={1}>Semana 1</option>
              ) : (
                semanas.map((semana) => (
                  <option key={`semana-opt-${semana}`} value={semana}>
                    Semana {semana}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col justify-center items-center bg-white p-4 rounded-xl border border-slate-200/60">
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Comisiones
            </p>
            <p className="text-3xl font-black text-indigo-600">{comisionesFiltradas.length}</p>
          </div>

          <div className="flex flex-col justify-center items-center bg-white p-4 rounded-xl border border-slate-200/60">
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Responsables asignados
            </p>
            <p className="text-3xl font-black text-emerald-600">{totalResponsables}</p>
          </div>
        </div>
      </div>

      {/* TÍTULO SECCIÓN */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Semana {semanaSeleccionada}
        </h2>
      </div>

      {/* TARJETAS */}
      {comisionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs font-medium">
          No hay comisiones programadas para la Semana {semanaSeleccionada}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {comisionesFiltradas.map((comision) => (
            <div
              key={`comision-card-${comision.id_unico}`}
              className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col justify-between"
            >
              {/* CARD HEADER */}
              <div className="bg-indigo-600 text-white px-5 py-3.5 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                  {comision.dia}
                </h3>
                <span className="text-xs font-bold bg-indigo-700/60 px-2.5 py-1 rounded-lg border border-indigo-400/30 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {comision.aula || "S/A"}
                </span>
              </div>

              {/* CARD BODY */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  {comision.nro && (
                    <p className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">Comisión:</span>
                      <strong className="text-slate-800">{comision.nro}</strong>
                    </p>
                  )}
                  {comision.fecha && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span><strong>Fecha:</strong> {comision.fecha}</span>
                    </p>
                  )}
                  {comision.hora && (
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span><strong>Horario:</strong> {comision.hora}</span>
                    </p>
                  )}
                  {comision.docente && (
                    <p className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span><strong>Docente:</strong> {comision.docente}</span>
                    </p>
                  )}
                  {comision.mailDocente && (
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate"><strong>Mail:</strong> {comision.mailDocente}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Responsables
                    </h4>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition active:scale-95"
                      onClick={() => abrirEditor(comision)}
                      title="Editar responsables"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 min-h-[90px] border border-slate-100 flex items-center">
                    {comision.responsables.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {comision.responsables.map((persona) => (
                          <span
                            key={persona}
                            className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-lg text-xs font-bold text-slate-700 shadow-2xs"
                          >
                            {persona}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Sin responsables asignados
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE EDICIÓN */}
      <EditResponsablesComisiones
        abierto={modalAbierto}
        comision={comisionSeleccionada}
        responsablesActuales={comisionSeleccionada?.responsables || []}
        onClose={() => setModalAbierto(false)}
        onGuardar={async (seleccionados) => {
          try {
            const asistentesTexto = seleccionados.join(";");

            const res = await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                accion: "editar_responsables_tutoria",
                id: comisionSeleccionada?.id_unico,
                asistentes: asistentesTexto,
              }),
            });

            const data = await res.json();

            if (!data.ok) {
              alert(data.mensaje || "Error al guardar los responsables");
              return;
            }

            if (typeof actualizarEventoLocal === "function") {
              await actualizarEventoLocal(data.evento);
            }

            setModalAbierto(false);
          } catch (error) {
            console.error("Error al actualizar responsables:", error);
            alert("No se pudo guardar la modificación.");
          }
        }}
      />
    </div>
  );
}

export default Comisiones;