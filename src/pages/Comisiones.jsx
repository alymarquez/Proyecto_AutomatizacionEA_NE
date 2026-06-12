import { useEffect, useState } from "react";

function Comisiones() {
  // Estados para guardar los datos y controlar la carga
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch a la API del Sheets
    fetch(
      "https://script.google.com/macros/s/AKfycbyhAuqJo-4AIx2uawmCVOnWKJaruDrqFgK_QZMO530l3ihiNYs6aCprMmClERksaLtDqA/exec",
    )
      .then((res) => res.json())
      .then((data) => {
        // Guardado de datos de las comisiones en el estado
        setComisiones(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando comisiones:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <h2 className="text-xl font-semibold text-green-700 animate-pulse">
          Cargando grilla de comisiones...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Encabezado Principal */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Acompañamiento de Comisiones Presenciales
        </h1>
        <p className="text-gray-500 mt-1">
          Planificación y asignación de Estudiantes Asistentes por aula y
          semana.
        </p>
      </div>

      {/* Contenedor de la Tabla Administrativa */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-600 text-white text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Comisión</th>
                <th className="p-4 font-semibold">Día, Horario y Aula</th>
                <th className="p-4 font-semibold">Docente</th>
                <th className="p-4 font-semibold">Asistente Asignado</th>
                <th className="p-4 font-semibold text-center">
                  Estado / Semanas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {comisiones.map((item, index) => (
                <tr key={index} className="hover:bg-green-50/50 transition">
                  {/* Nombre de la Comisión */}
                  <td className="p-4 font-bold text-green-700">
                    {item.nombre || "Comisión X"}
                  </td>

                  {/* Día, horario y aula */}
                  <td className="p-4">
                    <span className="block font-medium text-gray-900">
                      {item.dia_horario || "Lunes 18-22hs"}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono inline-block mt-1">
                      Aula: {item.aula || "Lab 3"}
                    </span>
                  </td>

                  {/* Datos del Docente */}
                  <td className="p-4">
                    <span className="block font-medium">
                      {item.docente_nombre || "Nombre Docente"}
                    </span>
                    <span className="text-xs text-gray-400 block">
                      {item.docente_mail || "mail@unahur.edu.ar"}
                    </span>
                  </td>

                  {/* Asistente que acompaña */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                        {(item.acompañante_asignado || "EA")[0]}
                      </div>
                      <span className="font-medium text-gray-800">
                        {item.acompañante_asignado || "Sin asignar"}
                      </span>
                    </div>
                  </td>

                  {/* Detalle de Semanas / Acciones */}
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Confirmado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Comisiones;
