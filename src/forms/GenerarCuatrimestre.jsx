import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  X,
  Loader2,
  CheckCircle2,
  CalendarRange,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Repeat,
  Sparkles
} from "lucide-react";

import { obtenerNombreDocente, formatearHora, esRegistroActivo, obtenerSiguienteId } from "../utils/academicoUtils";
import { parsearFechaLocal, generarEventosCuatrimestre } from "../utils/cuatrimestreUtils";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const NORMALIZAR_TIPO = {
  comision: "Comision",
  tutoria: "Tutoria",
  reunion: "Reunion"
};

const ESTILOS_TIPO = {
  Comision: "bg-blue-50 text-blue-700 border-blue-200",
  Tutoria: "bg-purple-50 text-purple-700 border-purple-200",
  Reunion: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export default function GenerarCuatrimestre({ open, onClose, onSuccess, comisiones = [], tutorias = [], usuarios = [], asistentes = [] }) {
  // Extraemos recargarDatos (o cargarDatos) si tu context lo expone para revalidar la App
  const { API_URL, calendario = [], recargarDatos } = useApp();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [comisionesSel, setComisionesSel] = useState({});
  const [tutoriasSel, setTutoriasSel] = useState({});
  const [expandidos, setExpandidos] = useState({});

  const [reunion, setReunion] = useState({
    incluir: true,
    dia: "Viernes",
    hora_desde: "11:00",
    hora_hasta: "12:00",
    aula: "Meet",
    titulo: "Reunión de equipo",
    asistentes: []
  });

  const comisionesActivas = useMemo(() => comisiones.filter((c) => esRegistroActivo(c.activo)), [comisiones]);
  const tutoriasActivas = useMemo(() => tutorias.filter((t) => esRegistroActivo(t.activo)), [tutorias]);

  // Bloquea scroll del fondo mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Reinicia la selección cada vez que se abre el modal
  useEffect(() => {
    if (!open) return;

    const inicialComisiones = {};
    comisionesActivas.forEach((c) => {
      const id = c.id_comisiones || c.id;
      inicialComisiones[id] = { incluir: true, asistentes: [] };
    });
    setComisionesSel(inicialComisiones);

    const inicialTutorias = {};
    tutoriasActivas.forEach((t) => {
      const id = t.id_tutorias || t.id;
      inicialTutorias[id] = { incluir: true, asistentes: [] };
    });
    setTutoriasSel(inicialTutorias);

    setFechaInicio("");
    setFechaFin("");
    setExpandidos({});
    setError("");
    setReunion((prev) => ({ ...prev, incluir: true, asistentes: [] }));
  }, [open, comisionesActivas, tutoriasActivas]);

  const toggleExpandido = (key) => setExpandidos((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleIncluirComision = (id) =>
    setComisionesSel((prev) => ({ ...prev, [id]: { ...prev[id], incluir: !prev[id]?.incluir } }));

  const toggleIncluirTutoria = (id) =>
    setTutoriasSel((prev) => ({ ...prev, [id]: { ...prev[id], incluir: !prev[id]?.incluir } }));

  const toggleAsistenteComision = (id, asistenteId) =>
    setComisionesSel((prev) => {
      const actual = prev[id]?.asistentes || [];
      const yaEsta = actual.includes(asistenteId);
      return {
        ...prev,
        [id]: { ...prev[id], asistentes: yaEsta ? actual.filter((a) => a !== asistenteId) : [...actual, asistenteId] }
      };
    });

  const toggleAsistenteTutoria = (id, asistenteId) =>
    setTutoriasSel((prev) => {
      const actual = prev[id]?.asistentes || [];
      const yaEsta = actual.includes(asistenteId);
      return {
        ...prev,
        [id]: { ...prev[id], asistentes: yaEsta ? actual.filter((a) => a !== asistenteId) : [...actual, asistenteId] }
      };
    });

  const toggleAsistenteReunion = (asistenteId) =>
    setReunion((prev) => {
      const yaEsta = prev.asistentes.includes(asistenteId);
      return { ...prev, asistentes: yaEsta ? prev.asistentes.filter((a) => a !== asistenteId) : [...prev.asistentes, asistenteId] };
    });

  // --- PREVISUALIZACIÓN ---
  const eventosGenerados = useMemo(() => {
    const fi = parsearFechaLocal(fechaInicio);
    const ff = parsearFechaLocal(fechaFin);
    if (!fi || !ff || ff < fi) return [];

    const comisionesIncluidas = comisionesActivas
      .filter((c) => comisionesSel[c.id_comisiones || c.id]?.incluir)
      .map((c) => ({ ...c, asistentes: comisionesSel[c.id_comisiones || c.id]?.asistentes || [] }));

    const tutoriasIncluidas = tutoriasActivas
      .filter((t) => tutoriasSel[t.id_tutorias || t.id]?.incluir)
      .map((t) => ({ ...t, asistentes: tutoriasSel[t.id_tutorias || t.id]?.asistentes || [] }));

    const eventos = generarEventosCuatrimestre({
      fechaInicio: fi,
      fechaFin: ff,
      comisiones: comisionesIncluidas,
      tutorias: tutoriasIncluidas,
      reunion
    });

    const siguienteId = obtenerSiguienteId(calendario, "id_calendario");

    // Normalizamos el campo `tipo` al formatear los eventos
    return eventos.map((ev, idx) => {
      const tipoNormalizado = NORMALIZAR_TIPO[ev.tipo?.toLowerCase()] || ev.tipo;
      return {
        ...ev,
        id_calendario: siguienteId + idx,
        tipo: tipoNormalizado
      };
    });
  }, [fechaInicio, fechaFin, comisionesActivas, tutoriasActivas, comisionesSel, tutoriasSel, reunion, calendario]);

  const conteoPorTipo = useMemo(() => {
    return eventosGenerados.reduce((acc, ev) => {
      acc[ev.tipo] = (acc[ev.tipo] || 0) + 1;
      return acc;
    }, {});
  }, [eventosGenerados]);

  // --- GENERAR (envío masivo) ---
  const handleGenerar = async () => {
    if (!fechaInicio || !fechaFin) {
      setError("Definí una fecha de inicio y una fecha de fin.");
      return;
    }
    if (parsearFechaLocal(fechaFin) < parsearFechaLocal(fechaInicio)) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }
    if (eventosGenerados.length === 0) {
      setError("No hay eventos para generar con la configuración actual.");
      return;
    }
    setError("");

    try {
      setSaving(true);

      const eventosAEnviar = eventosGenerados.map((ev) => ({
        ...ev,
        tipo: NORMALIZAR_TIPO[ev.tipo?.toLowerCase()] || ev.tipo
      }));

      const res = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "generar_cuatrimestre", eventos: eventosAEnviar })
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.mensaje || data.error || "No se pudo generar el cuatrimestre");

      if (typeof recargarDatos === "function") {
        await recargarDatos();
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al generar cuatrimestre:", err);
      setError("No se pudo generar el cuatrimestre. Intentá nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const inputStyles =
    "w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium tracking-tight outline-none transition focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400 shadow-3xs";
  const labelStyles = "text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5";

  const renderChipsAsistentes = (seleccionados, onToggle) => (
    <div className="flex flex-wrap gap-1 p-2.5 bg-white border border-slate-200 rounded-xl max-h-28 overflow-y-auto mt-2">
      {asistentes.length === 0 && (
        <span className="text-[10px] text-slate-400 italic">No hay asistentes disponibles.</span>
      )}
      {asistentes.map((a) => {
        const idAsistente = String(a.id_usuarios || a.id);
        const activo = seleccionados.includes(idAsistente);
        return (
          <button
            type="button"
            key={idAsistente}
            onClick={() => onToggle(idAsistente)}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition active:scale-95 ${
              activo
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            {a.nombre}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4 z-50">
      <div className="bg-slate-50/95 border border-slate-200/90 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden tracking-tight max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-slate-200/60 bg-white px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/40">
              <CalendarRange className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 leading-none">Generar Cuatrimestre</h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Crea automáticamente los eventos de comisiones, tutorías y reunión de equipo en el rango elegido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CUERPO */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* RANGO DE FECHAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelStyles}>
                <CalendarRange className="w-3.5 h-3.5 text-slate-400" /> Fecha de inicio *
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={inputStyles}
              />
            </div>
            <div>
              <label className={labelStyles}>
                <CalendarRange className="w-3.5 h-3.5 text-slate-400" /> Fecha de fin *
              </label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className={inputStyles} />
            </div>
          </div>

          {/* COMISIONES */}
          <div>
            <label className={labelStyles}>
              <Users className="w-3.5 h-3.5 text-slate-400" /> Comisiones activas ({comisionesActivas.length})
            </label>
            <div className="space-y-1.5">
              {comisionesActivas.length === 0 && (
                <p className="text-[11px] text-slate-400 italic px-1">No hay comisiones activas cargadas.</p>
              )}
              {comisionesActivas.map((c) => {
                const id = c.id_comisiones || c.id;
                const key = `comision-${id}`;
                const sel = comisionesSel[id] || { incluir: false, asistentes: [] };
                return (
                  <div key={id} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={!!sel.incluir}
                          onChange={() => toggleIncluirComision(id)}
                          className="w-3.5 h-3.5 accent-indigo-600 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            N° {c.nro_comision} · {obtenerNombreDocente(c.docente, usuarios)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {c.dia} {formatearHora(c.hora_desde)}-{formatearHora(c.hora_hasta)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {c.aula}
                            </span>
                          </p>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleExpandido(key)}
                        className="p-1 text-slate-400 hover:text-indigo-600 shrink-0"
                        title="Asignar asistentes"
                      >
                        {expandidos[key] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {expandidos[key] &&
                      renderChipsAsistentes(sel.asistentes || [], (aid) => toggleAsistenteComision(id, aid))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TUTORÍAS */}
          <div>
            <label className={labelStyles}>
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Tutorías activas ({tutoriasActivas.length})
            </label>
            <div className="space-y-1.5">
              {tutoriasActivas.length === 0 && (
                <p className="text-[11px] text-slate-400 italic px-1">No hay tutorías activas cargadas.</p>
              )}
              {tutoriasActivas.map((t) => {
                const id = t.id_tutorias || t.id;
                const key = `tutoria-${id}`;
                const sel = tutoriasSel[id] || { incluir: false, asistentes: [] };
                return (
                  <div key={id} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={!!sel.incluir}
                          onChange={() => toggleIncluirTutoria(id)}
                          className="w-3.5 h-3.5 accent-indigo-600 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">Tutoría</p>
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {t.dia} {formatearHora(t.horario)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {t.aula}
                            </span>
                          </p>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleExpandido(key)}
                        className="p-1 text-slate-400 hover:text-indigo-600 shrink-0"
                        title="Asignar asistentes"
                      >
                        {expandidos[key] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {expandidos[key] &&
                      renderChipsAsistentes(sel.asistentes || [], (aid) => toggleAsistenteTutoria(id, aid))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* REUNIÓN DE EQUIPO */}
          <div>
            <label className={labelStyles}>
              <Repeat className="w-3.5 h-3.5 text-slate-400" /> Reunión de equipo (semanal, fija)
            </label>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-3 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reunion.incluir}
                  onChange={() => setReunion((prev) => ({ ...prev, incluir: !prev.incluir }))}
                  className="w-3.5 h-3.5 accent-indigo-600"
                />
                <span className="text-xs font-bold text-slate-700">Incluir reunión de equipo en la generación</span>
              </label>

              {reunion.incluir && (
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">Título</label>
                    <input
                      type="text"
                      value={reunion.titulo}
                      onChange={(e) => setReunion((prev) => ({ ...prev, titulo: e.target.value }))}
                      className={inputStyles}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Día</label>
                      <select
                        value={reunion.dia}
                        onChange={(e) => setReunion((prev) => ({ ...prev, dia: e.target.value }))}
                        className={inputStyles}
                      >
                        {DIAS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Desde</label>
                      <input
                        type="text"
                        value={reunion.hora_desde}
                        onChange={(e) => setReunion((prev) => ({ ...prev, hora_desde: e.target.value }))}
                        placeholder="11:00"
                        className={inputStyles}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Hasta</label>
                      <input
                        type="text"
                        value={reunion.hora_hasta}
                        onChange={(e) => setReunion((prev) => ({ ...prev, hora_hasta: e.target.value }))}
                        placeholder="12:00"
                        className={inputStyles}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Aula / Espacio</label>
                      <input
                        type="text"
                        value={reunion.aula}
                        onChange={(e) => setReunion((prev) => ({ ...prev, aula: e.target.value }))}
                        placeholder="Meet"
                        className={inputStyles}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">Asistentes / equipo</label>
                    {renderChipsAsistentes(reunion.asistentes, toggleAsistenteReunion)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PREVISUALIZACIÓN */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-700">Previsualización</h3>
            </div>
            {eventosGenerados.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  Total: {eventosGenerados.length} eventos
                </span>
                {Object.entries(conteoPorTipo).map(([tipo, cantidad]) => (
                  <span
                    key={tipo}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${ESTILOS_TIPO[tipo] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    {tipo}: {cantidad}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Elegí un rango de fechas y al menos una comisión, tutoría o la reunión de equipo para ver la previsualización.
              </p>
            )}
          </div>

          {error && (
            <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </span>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white border-t border-slate-200/60 shrink-0">
          <button
            type="button"
            onClick={handleGenerar}
            disabled={saving || eventosGenerados.length === 0}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow-sm flex justify-center items-center gap-1.5 active:scale-[0.99]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generando eventos...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Generar {eventosGenerados.length > 0 ? `${eventosGenerados.length} eventos` : "eventos del cuatrimestre"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}