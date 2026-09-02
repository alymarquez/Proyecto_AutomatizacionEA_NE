import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import EditResponsablesTutorias from "../forms/EditResponsablesTutorias";
import {
  MessageSquare,
  User,
  BookOpen,
  ClipboardList,
  Calendar,
  MapPin,
  Clock,
  Edit3,
  Users,
  Search,
  FilterX,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from "lucide-react";
import RegistroTutoria from "../forms/RegistroTutoriasForm";

function formatearFechaLegible(fechaRaw) {
  if (!fechaRaw) return "";
  const fechaLimpia = String(fechaRaw).split("T")[0];
  const partes = fechaLimpia.split("-");
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }
  return fechaRaw;
}

function Tutorias() {
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);
  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vista, setVista] = useState("tutorias");
  const [mostrarFormularioRegistro, setMostrarFormularioRegistro] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);

  // Estados de Filtros para el Registro
  const [asistenteFiltroId, setAsistenteFiltroId] = useState("todos");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState(""); // <--- NUEVO FILTRO DE FECHA
  const [jornadasColapsadas, setJornadasColapsadas] = useState({});

  const {
    tutorias = [],
    eventos = [],
    usuarios = [],
    registroTutorias = [],
    loading,
    API_URL,
    actualizarEventoLocal,
    agregarRegistroTutoriaLocal,
    editarRegistroTutoriaLocal,
  } = useApp();

  const eventosTutorias = useMemo(() => {
    return eventos.filter((e) => {
      const tipoLimpio = String(e.tipo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
      return tipoLimpio === "tutoria";
    });
  }, [eventos]);

  const semanas = useMemo(() => {
    const setSemanas = new Set(
      eventosTutorias
        .map((e) => parseInt(e.semana, 10))
        .filter((s) => !isNaN(s) && s > 0)
    );
    return Array.from(setSemanas).sort((a, b) => a - b);
  }, [eventosTutorias]);

  useEffect(() => {
    if (semanas.length > 0 && !semanas.includes(semanaSeleccionada)) {
      setSemanaSeleccionada(semanas[0]);
    }
  }, [semanas]);

  const tutoriasFiltradas = useMemo(() => {
    return eventosTutorias
      .filter((item) => parseInt(item.semana, 10) === Number(semanaSeleccionada))
      .map((item) => {
        const info = tutorias.find(
          (t) => Number(t.id_tutorias || t.id) === Number(item.referencia_id)
        );

        const idsAsistentes = String(item.asistente_id || "")
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);

        const responsables = Array.from(
          new Set(
            idsAsistentes
              .map(
                (id) =>
                  usuarios.find((u) => Number(u.id_usuarios || u.id) === Number(id))
                    ?.nombre
              )
              .filter(Boolean)
          )
        );

        return {
          ...item,
          id_unico: item.id_calendario || item.id,
          fecha: formatearFechaLegible(item.fecha),
          semana: Number(item.semana),
          dia: info?.dia || item.dia || "",
          hora: info?.horario || item.hora || "",
          aula: info?.aula || item.aula || "",
          responsables,
        };
      });
  }, [eventosTutorias, semanaSeleccionada, tutorias, usuarios]);

  const totalResponsables = useMemo(() => {
    return tutoriasFiltradas.reduce((acc, t) => acc + t.responsables.length, 0);
  }, [tutoriasFiltradas]);

  const obtenerNombresAsistentes = (asistentesIds) => {
    if (!asistentesIds) return [];
    return String(asistentesIds)
      .split(";")
      .map((id) => id.trim())
      .filter(Boolean)
      .map((id) => {
        const usuario = usuarios.find(
          (u) => String(u.id_usuarios || u.id).trim() === id
        );
        if (!usuario) return null;
        return `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
      })
      .filter(Boolean);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    const dia = String(fechaObj.getUTCDate()).padStart(2, "0");
    const mes = String(fechaObj.getUTCMonth() + 1).padStart(2, "0");
    const anio = fechaObj.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // AGROUPAMIENTO Y FILTRADO MULTI-CRITERIO
  const registrosAgrupadosPorFecha = useMemo(() => {
    const filtrados = registroTutorias.filter((reg) => {
      // 1. Filtro por Fecha exacta
      if (fechaFiltro) {
        const fechaReg = String(reg.fecha || "").split("T")[0];
        if (fechaReg !== fechaFiltro) return false;
      }

      // 2. Filtro por Asistente
      if (asistenteFiltroId !== "todos") {
        const ids = String(reg.asistentes_ids || "")
          .split(";")
          .map((id) => id.trim());
        if (!ids.includes(String(asistenteFiltroId))) return false;
      }

      // 3. Búsqueda por Texto (Alumno / Comisión / Motivo)
      if (busquedaAlumno.trim()) {
        const query = busquedaAlumno.toLowerCase();
        const alumno = String(reg.alumno_nombre || "").toLowerCase();
        const comision = String(reg.comision || "").toLowerCase();
        const motivo = String(reg.motivo_consulta || "").toLowerCase();
        if (
          !alumno.includes(query) &&
          !comision.includes(query) &&
          !motivo.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });

    const grupos = {};
    filtrados.forEach((reg) => {
      const fechaClave = formatearFecha(reg.fecha);
      if (!grupos[fechaClave]) {
        grupos[fechaClave] = {
          fecha: fechaClave,
          asistentesIds: new Set(),
          consultas: [],
        };
      }
      grupos[fechaClave].consultas.push(reg);

      if (reg.asistentes_ids) {
        String(reg.asistentes_ids)
          .split(";")
          .map((id) => id.trim())
          .filter(Boolean)
          .forEach((id) => grupos[fechaClave].asistentesIds.add(id));
      }
    });

    return Object.values(grupos);
  }, [registroTutorias, asistenteFiltroId, busquedaAlumno, fechaFiltro]);

  const asistentesLista = usuarios.filter((u) => u.rol === "asistente");

  const toggleJornada = (fecha) => {
    setJornadasColapsadas((prev) => ({
      ...prev,
      [fecha]: !prev[fecha],
    }));
  };

  const limpiarFiltros = () => {
    setAsistenteFiltroId("todos");
    setBusquedaAlumno("");
    setFechaFiltro("");
  };

  const abrirEditor = (tutoria) => {
    setTutoriaSeleccionada(tutoria);
    setModalAbierto(true);
  };

  const abrirEditorRegistro = (registro) => {
    setRegistroEditando(registro);
    setMostrarFormularioRegistro(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Cargando tutorías...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-xs">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Tutorías Presenciales
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5 block">
              Organización semanal de turnos y registro de consultas
            </span>
          </div>
        </div>
      </div>

      {/* MENÚ VISTAS */}
      <div className="flex border-b border-slate-200 gap-2 mb-6">
        <button
          onClick={() => setVista("tutorias")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 cursor-pointer ${
            vista === "tutorias"
              ? "border-indigo-600 text-indigo-600 bg-white"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/60"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Tutorías programadas
        </button>

        <button
          onClick={() => setVista("registros")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 cursor-pointer ${
            vista === "registros"
              ? "border-indigo-600 text-indigo-600 bg-white"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/60"
          }`}
        >
          <ClipboardList className="w-4 h-4 text-slate-400 shrink-0" />
          Registro de tutorias
        </button>
      </div>

      {/* VISTA: TUTORÍAS PROGRAMADAS */}
      {vista === "tutorias" && (
        <>
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
                  Tutorías
                </p>
                <p className="text-3xl font-black text-indigo-600">
                  {tutoriasFiltradas.length}
                </p>
              </div>

              <div className="flex flex-col justify-center items-center bg-white p-4 rounded-xl border border-slate-200/60">
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Responsables asignados
                </p>
                <p className="text-3xl font-black text-emerald-600">
                  {totalResponsables}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Semana {semanaSeleccionada}
            </h2>
          </div>

          {tutoriasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs font-medium">
              No hay tutorías programadas para la Semana {semanaSeleccionada}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tutoriasFiltradas.map((tutoria) => (
                <div
                  key={`tutoria-card-${tutoria.id_unico}`}
                  className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col justify-between"
                >
                  <div className="bg-indigo-600 text-white px-5 py-3.5 flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                      {tutoria.dia}
                    </h3>
                    <span className="text-xs font-bold bg-indigo-700/60 px-2.5 py-1 rounded-lg border border-indigo-400/30 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {tutoria.aula || "S/A"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 text-xs text-slate-600 font-medium">
                      {tutoria.fecha && (
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            <strong>Fecha:</strong> {tutoria.fecha}
                          </span>
                        </p>
                      )}
                      {tutoria.hora && (
                        <p className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            <strong>Horario:</strong> {tutoria.hora}
                          </span>
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
                          onClick={() => abrirEditor(tutoria)}
                          title="Editar responsables"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 min-h-[90px] border border-slate-100 flex items-center">
                        {tutoria.responsables.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {tutoria.responsables.map((persona) => (
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
        </>
      )}

      {/* VISTA: REGISTRO DE CONSULTAS CON FILTRO POR FECHA */}
      {vista === "registros" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Registro de Jornadas de Tutorías
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Agrupado por día con detalle de consultas por estudiante.
                </p>
              </div>

              <button
                onClick={() => {
                  setRegistroEditando(null);
                  setMostrarFormularioRegistro(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
              >
                + Cargar Consulta
              </button>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              
              {/* FILTRO POR ASISTENTE */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Asistente:
                </span>

                <button
                  onClick={() => setAsistenteFiltroId("todos")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer border ${
                    asistenteFiltroId === "todos"
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Todos
                </button>

                {asistentesLista.map((asistente) => {
                  const isSelected =
                    String(asistenteFiltroId) === String(asistente.id_usuarios);
                  return (
                    <button
                      key={asistente.id_usuarios}
                      onClick={() =>
                        setAsistenteFiltroId(
                          isSelected ? "todos" : asistente.id_usuarios
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 cursor-pointer border ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {asistente.nombre.split(" ")[0]}
                    </button>
                  );
                })}
              </div>

              {/* CONTROLES DERECHA: FECHA + BÚSQUEDA */}
              <div className="flex flex-wrap items-center gap-2">
                {/* SELECTOR DE FECHA */}
                <div className="relative">
                  <input
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  />
                </div>

                {/* BÚSQUEDA POR TEXTO */}
                <div className="relative shrink-0 w-full sm:w-52">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar alumno o com..."
                    value={busquedaAlumno}
                    onChange={(e) => setBusquedaAlumno(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* BOTÓN LIMPIAR TODO */}
                {(asistenteFiltroId !== "todos" || busquedaAlumno || fechaFiltro) && (
                  <button
                    onClick={limpiarFiltros}
                    className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer border border-slate-200 rounded-xl hover:bg-rose-50"
                    title="Limpiar todos los filtros"
                  >
                    <FilterX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* JORNADAS AGRUPADAS */}
          {registrosAgrupadosPorFecha.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs font-medium">
              No hay registros que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="space-y-4">
              {registrosAgrupadosPorFecha.map((jornada) => {
                const nombresAsistentesJornada = obtenerNombresAsistentes(
                  Array.from(jornada.asistentesIds).join(";")
                );
                const estaColapsado = jornadasColapsadas[jornada.fecha];

                return (
                  <div
                    key={jornada.fecha}
                    className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden transition"
                  >
                    <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black text-slate-900 tracking-tight">
                              Jornada del {jornada.fecha}
                            </h3>
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                              {jornada.consultas.length}{" "}
                              {jornada.consultas.length === 1
                                ? "consulta"
                                : "consultas"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            <strong>Asistentes presentes:</strong>{" "}
                            {nombresAsistentesJornada.join(", ") ||
                              "Sin asistentes registrados"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleJornada(jornada.fecha)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition self-end sm:self-center cursor-pointer"
                      >
                        <span>{estaColapsado ? "Ver detalle" : "Ocultar"}</span>
                        {estaColapsado ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {!estaColapsado && (
                      <div className="divide-y divide-slate-100">
                        {jornada.consultas.map((consulta) => (
                          <div
                            key={consulta.id}
                            className="p-4 hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  {consulta.alumno_nombre || "Sin Nombre"}
                                </span>
                                {consulta.comision && (
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded-md">
                                    {consulta.comision}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-start gap-1.5 text-xs text-slate-600">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <p className="font-normal leading-snug">
                                  {consulta.motivo_consulta ||
                                    "Sin motivo registrado"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                              <button
                                type="button"
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition active:scale-95 cursor-pointer"
                                onClick={() => abrirEditorRegistro(consulta)}
                                title="Editar esta consulta"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALES */}
      <EditResponsablesTutorias
        abierto={modalAbierto}
        tutoria={tutoriaSeleccionada}
        responsablesActuales={tutoriaSeleccionada?.responsables || []}
        onClose={() => setModalAbierto(false)}
        onGuardar={async (seleccionados) => {
          try {
            const asistentesTexto = seleccionados.join(";");

            const res = await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                accion: "editar_responsables_tutoria",
                id: tutoriaSeleccionada?.id_unico,
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

      <RegistroTutoria
        open={mostrarFormularioRegistro}
        registro={registroEditando}
        onClose={() => {
          setMostrarFormularioRegistro(false);
          setRegistroEditando(null);
        }}
        onSuccess={(registroGuardado) => {
          if (registroEditando) {
            editarRegistroTutoriaLocal(registroGuardado);
          } else {
            agregarRegistroTutoriaLocal(registroGuardado);
          }

          setRegistroEditando(null);
          setMostrarFormularioRegistro(false);
        }}
      />
    </div>
  );
}

export default Tutorias;