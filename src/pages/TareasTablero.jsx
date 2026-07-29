import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Kanban, Plus, Clock, Loader2 } from "lucide-react";
import ModalTarea from "../forms/ModalTarea";

const COLUMNAS = [
  {
    id: "backlog",
    titulo: "Para hacer",
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
    dot: "bg-indigo-400",
  },
  {
    id: "en_progreso",
    titulo: "En Progreso",
    color: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
  },
  {
    id: "revision",
    titulo: "En Revisión",
    color: "bg-sky-50 text-sky-700 border-sky-100",
    dot: "bg-sky-400",
  },
  {
    id: "completado",
    titulo: "Completado",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-400",
  },
];

function TareasTablero() {
  const {
    tareas,
    usuarios,
    loading,
    API_URL,
    agregarTareaLocal,
    editarTareaLocal,
    eliminarTareaLocal,
    refreshDatos,
  } = useApp();

  const [isModalOpen, setModalOpen] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isModalOpen) {
        refreshDatos();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshDatos, isModalOpen]);

  const abrirModalNuevaTarea = () => {
    setTareaSeleccionada(null);
    setModalOpen(true);
  };

  const abrirModalEditarTarea = (tarea) => {
    setTareaSeleccionada(tarea);
    setModalOpen(true);
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, nuevaColumna) => {
    const tareaId = e.dataTransfer.getData("text/plain");
    const tareaAEditar = tareas.find((t) => String(t.id_tareas) === String(tareaId));

    if (!tareaAEditar) return;
    if (tareaAEditar.columna === nuevaColumna) return;

    // Actualización visual instantánea
    const tareaModificada = {
      ...tareaAEditar,
      columna: nuevaColumna,
    };

    editarTareaLocal(tareaModificada);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          accion: "cambiar_columna",
          id: tareaId,
          columna: nuevaColumna,
        }),
      });

      const data = await res.json();

      if (!data.ok) throw new Error();

      // Sincroniza con la BD por si otro usuario cambió algo
      refreshDatos();
    } catch (err) {
      console.error("Error sincronizando columna, revirtiendo...", err);

      refreshDatos();
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "Sin límite";

    // Limpiamos por si viene con tiempo (ej: "2026-06-20T00:00:00Z")
    const fechaLimpia = String(fechaStr).split("T")[0];
    const [year, month, day] = fechaLimpia.split("-");

    // Retorna formato DD/MM/YYYY
    return `${day}/${month}/${year.slice(-2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-slate-800 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          Sincronizando Tablero...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex flex-col flex-1 bg-slate-50/30 rounded-3xl border border-slate-100">
      {/* Encabezado del Tablero */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-xs">
            <Kanban className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Tablero tareas
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5 block">
              Gestión Interna Asistentes
            </span>
          </div>
        </div>

        <button
          onClick={abrirModalNuevaTarea}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nueva Tarea
        </button>
      </div>

      {/* CONTENEDOR DE LAS COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 flex-1 items-start">
        {COLUMNAS.map((col) => {
          const tareasFiltradas = tareas.filter((t) => t.columna === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-100/40 border border-slate-200/40 rounded-2xl p-3 flex flex-col min-h-[550px] backdrop-blur-3xs"
            >
              {/* Header de Columna */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                  <span className="text-xs font-black text-slate-700 tracking-tight">
                    {col.titulo}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200/60 px-2 py-0.5 rounded-md shadow-3xs">
                  {tareasFiltradas.length}
                </span>
              </div>

              {/* Contenedor de Tarjetas */}
              <div className="space-y-3 flex-1 overflow-y-auto pb-4">
                {tareasFiltradas.map((tarea) => {
                  const postItColors =
                    tarea.prioridad === "alta"
                      ? "bg-[#fff1f2] border-rose-200 hover:border-rose-300 text-rose-900 shadow-rose-100/50"
                      : tarea.prioridad === "baja"
                        ? "bg-[#f0fdf4] border-emerald-200 hover:border-emerald-300 text-emerald-900 shadow-emerald-100/40"
                        : "bg-[#fefce8] border-amber-200 hover:border-amber-300 text-amber-900 shadow-amber-100/50";

                  const tagPrioridad =
                    tarea.prioridad === "alta"
                      ? "bg-rose-500/10 text-rose-700 border-rose-200/40"
                      : tarea.prioridad === "baja"
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-200/40"
                        : "bg-amber-500/10 text-amber-700 border-amber-200/40";

                  let esUrgentePorFecha = false;
                  let mensajeVencimiento = "";

                  if (tarea.fecha_limite && tarea.columna !== "completado") {
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);

                    const fechaLimite = new Date(
                      String(tarea.fecha_limite).split("T")[0],
                    );
                    fechaLimite.setHours(0, 0, 0, 0);

                    const diferenciaDias = Math.floor(
                      (fechaLimite.getTime() - hoy.getTime()) / 86400000,
                    );

                    if (diferenciaDias < 0) {
                      esUrgentePorFecha = true;
                      mensajeVencimiento = "Vencida";
                    } else if (diferenciaDias === 0) {
                      esUrgentePorFecha = true;
                      mensajeVencimiento = "Hoy";
                    } else if (diferenciaDias === 1) {
                      esUrgentePorFecha = true;
                      mensajeVencimiento = "Mañana";
                    }
                  }

                  return (
                    <div
                      key={tarea.id_tareas}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tarea.id_tareas)}
                      onClick={() => abrirModalEditarTarea(tarea)}
                      className={`border p-4 rounded-xl shadow-3xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-grab active:cursor-grabbing select-none relative overflow-hidden flex flex-col justify-between min-h-[140px] ${postItColors} ${
                        esUrgentePorFecha ? "ring-1 ring-rose-400" : ""
                      }`}
                    >
                      {/* Badge Flotante Superior para Vencimiento */}
                      {esUrgentePorFecha && (
                        <div className="absolute top-2 right-2 bg-rose-600 text-white font-extrabold text-[8px] tracking-wide px-1.5 py-0.5 rounded-md uppercase shadow-xs">
                          {mensajeVencimiento}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${tagPrioridad}`}
                          >
                            Prioridad: {tarea.prioridad}
                          </span>
                          {!esUrgentePorFecha && (
                            <span className="text-[10px] font-mono font-bold opacity-40">
                              #{String(tarea.id_tareas).padStart(3, "0")}
                            </span>
                          )}
                        </div>

                        {/* Título y Descripción */}
                        <h3 className="text-xs font-bold tracking-tight leading-snug mb-1 text-slate-800 pr-10">
                          {tarea.titulo}
                        </h3>
                        <p className="text-[11px] font-medium opacity-70 leading-relaxed mb-4 line-clamp-2">
                          {tarea.descripcion}
                        </p>
                      </div>

                      {/* Footer de la tarjeta */}
                      <div
                        className="flex items-center justify-between pt-2.5 border-t border-slate-900/5 text-[10px] font-bold text-slate-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5 text-slate-500/80">
                          <Clock className="w-3 h-3 opacity-60" />
                          <span className="font-mono text-[9px] font-bold tracking-tight">
                            {formatearFecha(tarea.fecha_limite)}
                          </span>
                        </div>

                        {/* Encargados */}
                        <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                          {(() => {
                            const idsAsignados = tarea.asistente_ids
                              ? String(tarea.asistente_ids)
                                  .split(";")
                                  .map((id) => id.trim())
                                  .filter(Boolean)
                              : [];
                            if (idsAsignados.length === 0) {
                              return (
                                <span className="bg-white/60 border border-slate-200/40 px-1.5 py-0.5 rounded-md text-slate-400 font-medium text-[9px]">
                                  Libre
                                </span>
                              );
                            }
                            return idsAsignados.map((id) => {
                              const asistenteObj = usuarios.find(
                                (a) => String(a.id_usuarios) === String(id),
                              );
                              return (
                                <span
                                  key={id}
                                  className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-700 font-bold text-[9px] max-w-[75px] truncate shadow-3xs"
                                  title={
                                    asistenteObj ? asistenteObj.nombre : id
                                  }
                                >
                                  <span className="truncate">
                                    {asistenteObj
                                      ? asistenteObj.nombre.split(" ")[0]
                                      : id}
                                  </span>
                                </span>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Zona de Drop Vacía */}
                {tareasFiltradas.length === 0 && (
                  <div className="h-20 border border-dashed border-slate-300/60 rounded-xl flex items-center justify-center p-4 text-center bg-slate-50/20">
                    <p className="text-[9px] font-black text-slate-400/70 tracking-wider uppercase">
                      Arrastrá actividades acá
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ModalTarea
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onTareaCreada={agregarTareaLocal}
        onTareaEditada={editarTareaLocal}
        onTareaElimitada={eliminarTareaLocal}
        API_URL={API_URL}
        asistentes={usuarios.filter(u => u.rol === "asistente")}
        tareaAEditar={tareaSeleccionada}
      />
    </div>
  );
}

export default TareasTablero;
