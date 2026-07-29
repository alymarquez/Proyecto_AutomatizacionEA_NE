import { useState } from "react";
import { useApp } from "../context/AppContext";
import EditResponsablesTutorias from "../forms/EditResponsablesTutorias";
import { BookOpen } from "lucide-react";

function Tutorias() {
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);
  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  

  const { tutorias, eventos, usuarios, loading, API_URL, actualizarEventoLocal, } = useApp();

  if (loading) {
    return <div className="p-10">Cargando tutorías...</div>;
  }

  const abrirEditor = (tutoria) => {
      setTutoriaSeleccionada(tutoria);
      setModalAbierto(true);
    };

  const eventosTutorias = eventos.filter(
    e => e.tipo === "Tutoria"
  );

  const tutoriasFiltradas = eventosTutorias
  .filter(item => Number(item.semana) === semanaSeleccionada)
  .map(item => {

    const info = tutorias.find(
      t => Number(t.id_tutorias) === Number(item.referencia_id)
    );

    const responsables = [
      ...new Set(
        String(item.asistente_id || "")
          .split(";")
          .filter(Boolean)
          .map(id =>
            usuarios.find(a => Number(a.id_usuarios) === Number(id))?.nombre
          )
          .filter(Boolean)
      )
    ];

    return {
      ...item,

      fecha: new Date(item.fecha).toLocaleDateString("es-AR"),
      fechaReal: new Date(item.fecha),

      semana: Number(item.semana),

      dia: info?.dia || "",
      hora: info?.horario
        ? new Date(info.horario).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "",
      aula: info?.aula || "",

      responsables
    };
  });

  const semanas = [
    ...new Set(
        eventosTutorias.map(e => Number(e.semana))
    )
].sort((a,b)=>a-b);


  const totalResponsables = tutoriasFiltradas.reduce(
    (acc, t) => acc + t.responsables.length,
    0
  );

  return (
  <div className="max-w-7xl mx-auto px-8 py-10">

    {/* HEADER */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6 mb-6">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-xs">
            <BookOpen className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            Tutorías Presenciales
          </h1>

          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5 block">
            Organización semanal de tutorías y asignación de estudiantes asistentes.
          </span>
        </div>
      </div>

      
    </div>

    {/* RESUMEN */}
    <div className="bg-slate-100/40 rounded-2xl shadow-md border border-slate-200/40 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="flex flex-col justify-center items-center">
          <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
            Semana seleccionada
          </label>

          <select
            value={semanaSeleccionada}
            onChange={(e) => setSemanaSeleccionada(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium tracking-tight outline-none transition focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400 shadow-3xs"
          >
            {semanas.map((semana) => (
              <option key={semana} value={semana}>
                Semana {semana}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col justify-center items-center">
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">Tutorías</p>
          <p className="text-3xl font-bold text-indigo-600">
            {tutoriasFiltradas.length}
          </p>
        </div>

        <div className="flex flex-col justify-center items-center">
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">Responsables asignados</p>
          <p className="text-3xl font-bold text-green-600">
            {totalResponsables}
          </p>
        </div>

      </div>
    </div>

    {/* TITULO */}
    <div className="mb-6">
      <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
        Semana {semanaSeleccionada}
      </h2>
    </div>

    {/* TARJETAS */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {tutoriasFiltradas.map((tutoria) => (

        <div
          key={tutoria.id}
          className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
        >

          <div className="bg-indigo-600 text-white px-5 py-4">
            <div className="flex justify-between items-center">

              <h3 className="text-lg uppercase font-bold text-white tracking-wider flex items-center gap-1.5 mb-1.5">
                {tutoria.dia}
              </h3>

              <span className="text-white">
                {tutoria.aula}
              </span>

            </div>
          </div>

          <div className="p-6">

            <div className="space-y-3 text-gray-700 mb-6">

              <p>
                <strong>Fecha:</strong> {tutoria.fecha}
              </p>

              <p>
                <strong>Horario:</strong> {tutoria.hora}
              </p>

            </div>

            <div>
              <div className="flex justify-between items-center mb-2">

                <h4 className="font-semibold text-gray-800">
                  Responsables
                </h4>
              
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-400 bg-white text-gray-600 hover:text-indigo-800 hover:border-indigo-400 transition"
                  onClick={() => abrirEditor(tutoria)}
                >
                  ✎
                </button>

              </div>

              <div className="bg-gray-100 rounded-xl p-3 min-h-[110px]">

                {tutoria.responsables.length ? (

                  <div className="flex flex-wrap gap-2">

                    {tutoria.responsables.map((persona) => (

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
                    Sin responsables asignados
                  </span>

                )}

              </div>

            </div>

            

          </div>

        </div>

      ))}

    </div>

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
            body: JSON.stringify({
              accion: "editar_responsables_tutoria",
              id: tutoriaSeleccionada.id_calendario,
              asistentes: asistentesTexto,
            }),
          });

          const data = await res.json();

          if (!data.ok) {
            alert("Error al guardar");
            return;
          }

          await actualizarEventoLocal(data.evento);

          setModalAbierto(false);

        } catch (error) {
          console.error(error);
          alert("No se pudo guardar");
        }
      }}
    />

  </div>
);
}

export default Tutorias;