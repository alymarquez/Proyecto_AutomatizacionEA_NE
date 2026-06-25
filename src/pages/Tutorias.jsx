import { useState } from "react";

function Tutorias() {
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);

  const tutoriasEjemplo = [
    {
      id: 1,
      semana: 1,
      fecha: "03/08/2026",
      dia: "Lunes",
      hora: "12:00",
      aula: "TA 206",
      responsables: ["Alina", "Sebastian"],
    },
    {
      id: 2,
      semana: 1,
      fecha: "05/08/2026",
      dia: "Miércoles",
      hora: "09:00",
      aula: "TA 206",
      responsables: ["Lucía"],
    },
    {
      id: 3,
      semana: 1,
      fecha: "07/08/2026",
      dia: "Viernes",
      hora: "17:00",
      aula: "TA 207",
      responsables: [],
    },
    {
      id: 4,
      semana: 2,
      fecha: "10/08/2026",
      dia: "Lunes",
      hora: "12:00",
      aula: "TA 206",
      responsables: ["Matías"],
    },
    {
      id: 5,
      semana: 2,
      fecha: "12/08/2026",
      dia: "Miércoles",
      hora: "09:00",
      aula: "TA 206",
      responsables: ["Yasmin"],
    },
    {
      id: 6,
      semana: 2,
      fecha: "14/08/2026",
      dia: "Viernes",
      hora: "17:00",
      aula: "TA 207",
      responsables: ["Laura"],
    },
  ];

  const semanas = [...new Set(tutoriasEjemplo.map((t) => t.semana))];

  const tutoriasFiltradas = tutoriasEjemplo.filter(
    (t) => t.semana === semanaSeleccionada
  );

  const totalResponsables = tutoriasFiltradas.reduce(
    (acc, t) => acc + t.responsables.length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">
            Tutorías Presenciales
          </h1>

          <p className="text-gray-500 text-lg mt-3">
            Organización semanal de tutorías y asignación de estudiantes
            asistentes.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl shadow">
            + Generar Cuatrimestre
          </button>

          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-xl shadow">
            Eliminar Cuatrimestre
          </button>
        </div>
      </div>

      {/* RESUMEN */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Semana seleccionada
            </label>

            <select
              value={semanaSeleccionada}
              onChange={(e) =>
                setSemanaSeleccionada(Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg p-3"
            >
              {semanas.map((semana) => (
                <option key={semana} value={semana}>
                  Semana {semana}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-500">Tutorías</p>
            <p className="text-3xl font-bold text-indigo-600">
              {tutoriasFiltradas.length}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Responsables asignados</p>
            <p className="text-3xl font-bold text-green-600">
              {totalResponsables}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              Activo
            </span>
          </div>

        </div>
      </div>

      {/* TITULO SEMANA */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
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
                <h3 className="font-bold text-lg">
                  {tutoria.dia}
                </h3>

                <span className="text-indigo-100">
                  {tutoria.aula}
                </span>
              </div>
            </div>

            <div className="p-5">

              <div className="space-y-2 text-gray-700 mb-5">
                <p>
                  <strong>Fecha:</strong> {tutoria.fecha}
                </p>

                <p>
                  <strong>Horario:</strong> {tutoria.hora} hs
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Responsables
                </h4>

                <div className="bg-gray-100 rounded-xl p-3 min-h-[110px]">

                  {tutoria.responsables.length > 0 ? (
                    <div className="flex flex-wrap gap-2">

                      {tutoria.responsables.map((persona) => (
                        <span
                          key={persona}
                          className="bg-white border border-gray-300 px-3 py-1 rounded-full text-sm"
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

              <div className="flex gap-2 mt-5">

                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium">
                  Agregar
                </button>

                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium">
                  Quitar
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default Tutorias;