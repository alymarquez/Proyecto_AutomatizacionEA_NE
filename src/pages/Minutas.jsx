import { useEffect, useState } from "react";
import AddMinutaForm from "../forms/AddMinutas";
import EditMinutas from "../forms/EditMinutas";
import { ClipboardList, Pencil } from "lucide-react";
import { useApp } from "../context/AppContext";

function Minutas() {
  
    const { usuarios, minutas, loading, API_URL, agregarMinutaLocal, refreshDatos, actualizarMinutaLocal, totalMinutas } = useApp();

    const [openAddModal, setOpenAddModal] = useState(false);

    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [minutaSeleccionada, setMinutaSeleccionada] = useState(null);

    const [pagina, setPagina] = useState(1);
    useEffect(() => {refreshDatos(true, pagina);}, [pagina]);
  
    if (loading) {
        return (
        <div className="p-6">
            <h1>Cargando minutas...</h1>
        </div>
        );
    }
    /*const minutasOrdenadas = [...minutas]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 10);*/
    
    const minutasProcesadas = minutas.map((minuta) => ({
  ...minuta,
  participantesNombres: [
    ...new Set(
      String(minuta.participantes || "")
        .split(";")
        .filter(Boolean)
        .map((id) =>
          usuarios.find(
            (u) => Number(u.id_usuarios) === Number(id)
          )?.nombre
        )
        .filter(Boolean)
    ),
  ],
}));

const LIMITE = 5;

const totalPaginas = Math.ceil(totalMinutas / LIMITE);

const paginaAnterior = () => {
  if (pagina > 1) {
    setPagina(pagina - 1);
  }
};

const paginaSiguiente = () => {
  if (pagina < totalPaginas) {
    setPagina(pagina + 1);
  }
};

const guardarMinuta = async (nuevaMinuta) => {
    
  try {

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        accion: "guardar_minuta",
        ...nuevaMinuta
      })
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

    // actualizar el estado local
  } catch (err) {
    console.error(err);
  }
}


    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6 mb-6">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-xs">
                        <ClipboardList className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            Minutas
                        </h1>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5 block">
                            Notas y apuntes de la reunion semanal.
                        </span>
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center"></div>
                <button
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs flex justify-center items-center gap-1.5 active:scale-[0.98]"
                    onClick={() => setOpenAddModal(true)}
                >
                    + Agregar minuta
                </button>
            </div>
            {/* Lista de minutas */}
            <div className="space-y-6">
                {minutasProcesadas.map((minuta) => (
                <div
                    key={minuta.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
                >
                {/* HEADER */}
                <div className="bg-indigo-600 text-white px-5 py-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">
                            Reunión{" "}
                            {new Date(minuta.fecha).toLocaleDateString("es-AR")}
                        </h3>
                        <button
                            onClick={() => {
                                setMinutaSeleccionada(minuta);
                                setModalEditarOpen(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:text-indigo-800 hover:border-indigo-400 transition"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {/* CUERPO */}
                <div className="p-6">
                    {/* Participantes */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-800">
                                Participantes
                            </h4>
                        </div>
                        <div className="bg-gray-100 rounded-xl p-3 min-h-[110px]">
                            {minuta.participantesNombres.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {minuta.participantesNombres.map((persona) => (
                                    <span
                                        key={persona}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm"
                                    >
                                        {persona}
                                    </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400">
                                    Sin participantes
                                </span>
                            )}
                        </div>
                        {/* Temas */}
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-800 mb-2">
                                Temas tratados
                            </h4>
                            <div
                                className="whitespace-pre-wrap [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1"
                                dangerouslySetInnerHTML={{
                                    __html: minuta.temasTratados,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            ))}
            {/* Paginación */}

<div className="flex justify-center items-center gap-4 mt-8">

  <button
    onClick={paginaAnterior}
    disabled={pagina === 1}
    className="px-4 py-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
  >
    ← Anterior
  </button>

  <span className="text-sm font-semibold text-slate-700">
    Página {pagina} de {totalPaginas || 1}
  </span>

  <button
    onClick={paginaSiguiente}
    disabled={pagina === totalPaginas || totalPaginas === 0}
    className="px-4 py-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
  >
    Siguiente →
  </button>

</div>
        </div>
    
        {/* Modal agregar */}
      {openAddModal && (
        <AddMinutaForm
          onClose={() => setOpenAddModal(false)}
          onSave={guardarMinuta}
        />
      )}
      {/* Modal editar */}
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
)}

export default Minutas;

