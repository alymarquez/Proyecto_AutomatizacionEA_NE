import { useState, useMemo } from "react";
import AddMinutaForm from "../forms/AddMinutas";
import EditMinutas from "../forms/EditMinutas";
import {
  ClipboardList,
  Pencil,
  Search,
  Calendar,
  FilterX,
  ChevronDown,
  ChevronUp,
  Plus,
  Users,
  FileText,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

function formatearFechaLegible(fechaRaw) {
  if (!fechaRaw) return "";
  const fechaLimpia = String(fechaRaw).split("T")[0];
  const partes = fechaLimpia.split("-");
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const numMes = parseInt(mes, 10) - 1;
    return `${dia} de ${meses[numMes] || mes}, ${anio}`;
  }
  return fechaRaw;
}

function Minutas() {
  const {
    usuarios,
    minutas = [],
    loading,
    API_URL,
    agregarMinutaLocal,
    actualizarMinutaLocal,
  } = useApp();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [minutaSeleccionada, setMinutaSeleccionada] = useState(null);

  // Filtros
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [minutasExpandidas, setMinutasExpandidas] = useState({});

  // Paginación
  const [pagina, setPagina] = useState(1);
  const LIMITE = 5;

  const minutasProcesadas = useMemo(() => {
    return minutas.map((minuta) => ({
      ...minuta,
      participantesNombres: [
        ...new Set(
          String(minuta.participantes || "")
            .split(";")
            .filter(Boolean)
            .map(
              (id) =>
                usuarios.find((u) => Number(u.id_usuarios) === Number(id))
                  ?.nombre
            )
            .filter(Boolean)
        ),
      ],
    }));
  }, [minutas, usuarios]);

  const minutasFiltradas = useMemo(() => {
    return minutasProcesadas.filter((minuta) => {
      if (fechaFiltro) {
        const fechaMinuta = String(minuta.fecha || "").split("T")[0];
        if (fechaMinuta !== fechaFiltro) return false;
      }

      if (busquedaTexto.trim()) {
        const query = busquedaTexto.toLowerCase();
        const textoTemas = String(minuta.temasTratados || "").toLowerCase();
        const fechaTexto = String(minuta.fecha || "").toLowerCase();

        if (!textoTemas.includes(query) && !fechaTexto.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [minutasProcesadas, fechaFiltro, busquedaTexto]);

  const totalPaginas = Math.ceil(minutasFiltradas.length / LIMITE) || 1;

  const minutasPaginadas = useMemo(() => {
    const inicio = (pagina - 1) * LIMITE;
    return minutasFiltradas.slice(inicio, inicio + LIMITE);
  }, [minutasFiltradas, pagina]);

  const toggleExpandir = (id) => {
    setMinutasExpandidas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const limpiarFiltros = () => {
    setBusquedaTexto("");
    setFechaFiltro("");
    setPagina(1);
  };

  const guardarMinuta = async (nuevaMinuta) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          accion: "guardar_minuta",
          ...nuevaMinuta,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        agregarMinutaLocal(data.minuta);
        setOpenAddModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const actualizarMinuta = async (minutaActualizada) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          accion: "actualizar_minuta",
          ...minutaActualizada,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        actualizarMinutaLocal(data.minuta);
        setModalEditarOpen(false);
        setMinutaSeleccionada(null);
      } else {
        alert(data.mensaje);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider animate-pulse">
          <Sparkles className="w-4 h-4 text-indigo-500" /> Cargando minutas ejecutivas...
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 max-w-6xl mx-auto w-full flex flex-col flex-1 bg-slate-50/50 rounded-3xl border border-slate-200/60 shadow-2xs">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm ring-1 ring-slate-900/10">
            <ClipboardList className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Minutas de Equipo
              </h1>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Acuerdos, temas tratados y compromisos de las reuniones
            </p>
          </div>
        </div>

        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs hover:shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          onClick={() => setOpenAddModal(true)}
        >
          <Plus className="w-4 h-4" /> Nueva Minuta
        </button>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 mb-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por temas, palabras clave..."
            value={busquedaTexto}
            onChange={(e) => {
              setBusquedaTexto(e.target.value);
              setPagina(1);
            }}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative">
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => {
                setFechaFiltro(e.target.value);
                setPagina(1);
              }}
              className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
            />
          </div>

          {(busquedaTexto || fechaFiltro) && (
            <button
              onClick={limpiarFiltros}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition cursor-pointer"
              title="Limpiar filtros"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* TARJETAS */}
      {minutasPaginadas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 text-xs font-medium">
          No se encontraron actas o minutas con el criterio seleccionado.
        </div>
      ) : (
        <div className="space-y-4">
          {minutasPaginadas.map((minuta) => {
            const estaExpandida = minutasExpandidas[minuta.id];

            return (
              <div
                key={minuta.id}
                className={`bg-white border transition-all duration-200 rounded-2xl overflow-hidden ${
                  estaExpandida
                    ? "border-indigo-200 shadow-md ring-1 ring-indigo-500/10"
                    : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Info Fecha y Participantes */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0 border border-slate-200/60 mt-0.5 sm:mt-0">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">
                          Reunión — {formatearFechaLegible(minuta.fecha)}
                        </h3>
                      </div>

                      {/* Asistentes Badge Row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                          <Users className="w-3 h-3" /> Asistentes:
                        </span>

                        {minuta.participantesNombres.length ? (
                          minuta.participantesNombres.map((persona) => (
                            <span
                              key={persona}
                              className="text-[10px] font-semibold bg-slate-100/80 border border-slate-200/60 px-2 py-0.5 rounded-md text-slate-700"
                            >
                              {persona}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Sin asistentes asentados
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones e Interacción */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        setMinutaSeleccionada(minuta);
                        setModalEditarOpen(true);
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 transition cursor-pointer"
                      title="Editar minuta"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleExpandir(minuta.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer ${
                        estaExpandida
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{estaExpandida ? "Ocultar minuta" : "Ver temas"}</span>
                      {estaExpandida ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* DESPLEGABLE */}
                {estaExpandida && (
                  <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <div className="flex items-center gap-1.5 mb-2.5 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <Sparkles className="w-3 h-3 text-indigo-500" /> Temas tratados:
                    </div>

                    <div
                      className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-3xs prose prose-slate max-w-none text-slate-700 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1"
                      dangerouslySetInnerHTML={{
                        __html: minuta.temasTratados,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CONTROLES DE PAGINACIÓN */}
      <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-200/60 text-xs">
        <p className="text-slate-400 font-medium">
          Mostrando página <strong className="text-slate-700">{pagina}</strong> de{" "}
          <strong className="text-slate-700">{totalPaginas}</strong>
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(p - 1, 1))}
            disabled={pagina === 1}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer shadow-3xs"
          >
            ← Anterior
          </button>

          <button
            onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer shadow-3xs"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* MODALES */}
      {openAddModal && (
        <AddMinutaForm
          onClose={() => setOpenAddModal(false)}
          onSave={guardarMinuta}
        />
      )}

      {modalEditarOpen && minutaSeleccionada && (
        <EditMinutas
          minuta={minutaSeleccionada}
          onClose={() => {
            setModalEditarOpen(false);
            setMinutaSeleccionada(null);
          }}
          onSave={actualizarMinuta}
        />
      )}
    </div>
  );
}

export default Minutas;