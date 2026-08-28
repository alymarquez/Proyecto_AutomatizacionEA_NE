import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import EditResponsablesTutorias from "../forms/EditResponsablesTutorias";
import { MessageSquare, User, BookOpen, ClipboardList, Calendar, MapPin, Clock, Edit3, Users } from "lucide-react";
import RegistroTutoria from "../forms/RegistroTutoriasForm";

// Función auxiliar para formatear la fecha sin importar si viene como ISO String o YYYY-MM-DD
function formatearFechaLegible(fechaRaw) {
  if (!fechaRaw) return "";
  
  // Si viene en formato ISO (ej: 2026-06-26T03:00:00.000Z)
  const fechaLimpia = String(fechaRaw).split("T")[0]; // "2026-06-26"
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

  const { tutorias = [], eventos = [], usuarios = [], registroTutorias = [], loading, API_URL, actualizarEventoLocal, agregarRegistroTutoriaLocal, editarRegistroTutoriaLocal } = useApp();

  // filtra los eventos de tipo Tutoría
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

  // extrae semanas únicas válidas y ordenadas
  const semanas = useMemo(() => {
    const setSemanas = new Set(
      eventosTutorias
        .map((e) => parseInt(e.semana, 10))
        .filter((s) => !isNaN(s) && s > 0)
    );
    return Array.from(setSemanas).sort((a, b) => a - b);
  }, [eventosTutorias]);

  // ajusta semana por defecto si cambia la lista de semanas
  useEffect(() => {
    if (semanas.length > 0 && !semanas.includes(semanaSeleccionada)) {
      setSemanaSeleccionada(semanas[0]);
    }
  }, [semanas]);

  // mapea las tutorías de la semana seleccionada
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
              .map((id) => usuarios.find((u) => Number(u.id_usuarios || u.id) === Number(id))?.nombre)
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
          responsables
        };
      });
  }, [eventosTutorias, semanaSeleccionada, tutorias, usuarios]);

  const totalResponsables = useMemo(() => {
    return tutoriasFiltradas.reduce((acc, t) => acc + t.responsables.length, 0);
  }, [tutoriasFiltradas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando tutorías...</p>
      </div>
    );
  }

  const abrirEditor = (tutoria) => {
    setTutoriaSeleccionada(tutoria);
    setModalAbierto(true);
  };

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

  if (Number.isNaN(fechaObj.getTime())) {
    return fecha;
  }

  const dia = String(fechaObj.getUTCDate()).padStart(2, "0");
  const mes = String(fechaObj.getUTCMonth() + 1).padStart(2, "0");
  const anio = fechaObj.getUTCFullYear();

  return `${dia}/${mes}/${anio}`;
};

const abrirEditorRegistro = (registro) => {
  setRegistroEditando(registro);
  setMostrarFormularioRegistro(true);
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-xs">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Tutorías
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5 block">
              Organización semanal de tutorías y asignación de estudiantes asistentes
            </span>
          </div>
        </div>
      </div>
      {/*MENU VISTAS*/}
      <div className="flex border-b border-slate-200 gap-2 mb-6">
        {/*className="flex flex-wrap gap-2 mb-6"*/}
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
          Registro de tutorías
        </button>
      </div>
      {vista === "tutorias" && (
      <>
      {/* RESUMEN */}
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
            <p className="text-3xl font-black text-indigo-600">{tutoriasFiltradas.length}</p>
          </div>

          <div className="flex flex-col justify-center items-center bg-white p-4 rounded-xl border border-slate-200/60">
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Responsables asignados
            </p>
            <p className="text-3xl font-black text-emerald-600">{totalResponsables}</p>
          </div>
        </div>
      </div>

      {/* TITULO SECCIÓN */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Semana {semanaSeleccionada}
        </h2>
      </div>

      {/* TARJETAS */}
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
              {/* CARD HEADER */}
              <div className="bg-indigo-600 text-white px-5 py-3.5 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                  {tutoria.dia}
                </h3>
                <span className="text-xs font-bold bg-indigo-700/60 px-2.5 py-1 rounded-lg border border-indigo-400/30 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {tutoria.aula || "S/A"}
                </span>
              </div>

              {/* CARD BODY */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  {tutoria.fecha && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span><strong>Fecha:</strong> {tutoria.fecha}</span>
                    </p>
                  )}
                  {tutoria.hora && (
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span><strong>Horario:</strong> {tutoria.hora}</span>
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

    {vista === "registros" && (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Registro de tutorías
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Registros de las tutorías realizadas.
          </p>
        </div>

        <button
          onClick={() => setMostrarFormularioRegistro(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
        >
          + Nuevo registro
        </button>
      </div>
      {registroTutorias.length === 0 ? (
      <div className="text-center py-10 text-gray-500">
        No hay registros de tutorías.
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {registroTutorias.map((registro) => {
          const nombresAsistentes = obtenerNombresAsistentes(
            registro.asistentes_ids
          );
  
          return (
            <div
              key={registro.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex-1 flex flex-col justify-between space-y-4"
            >

              <div className="space-y-2 text-xs text-slate-600 font-medium">

                {/* Fecha + botón editar */}
                  <div className="flex justify-between items-start">
                    {registro.fecha && (
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          <strong>Fecha:</strong> {formatearFecha(registro.fecha)}
                        </span>
                      </p>
                    )}

                    <button
                      type="button"
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition active:scale-95"
                      onClick={() => abrirEditorRegistro(registro)}
                      title="Editar registro"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                {/* Estudiante */}
                <p className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>Estudiante:</strong>{" "}
                    {registro.alumno_nombre || ""}
                  </span>
                </p>

                {/* Comisión SIEMPRE visible */}
                <p className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>Comisión:</strong>{" "}
                    {registro.comision || ""}
                  </span>
                </p>

              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Encargado/s de tutoría
                  </h4>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 min-h-[90px] border border-slate-100 flex items-center">
                  {nombresAsistentes.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {nombresAsistentes.map((persona) => (
                        <span
                          key={`${registro.id}-${persona}`}
                          className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-lg text-xs font-bold text-slate-700 shadow-2xs"
                        >
                          {persona}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Sin asistentes asignados
                    </span>
                  )}
                </div>
                
              </div>

              {/* COMENTARIOS SIEMPRE VISIBLES */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Comentarios
                </h4>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 min-h-[50px]">
                  <p className="text-xs text-slate-600 whitespace-pre-wrap">
                    {registro.motivo_consulta || ""}
                  </p>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    )}
  </div>
    )}


      {/* MODAL DE EDICIÓN */}
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
                asistentes: asistentesTexto
              })
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