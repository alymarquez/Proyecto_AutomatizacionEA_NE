import { useEffect, useState } from "react";
import AddMinutaForm from "../forms/AddMinutas";

function Minutas() {
  const [minutas, setMinutas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] =
    useState(false);

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycbwQhlCZkVu0_zrOEtt0OcNsk_rSWm0NRh9I8seySJ9eLNYdBmj23gpSQD09-lmFxq_P/exec"
    )
      .then((res) => res.json())
      .then((data) => {
        const ordenadas = data.sort(
          (a, b) => Number(b.id) - Number(a.id)
        );

        setMinutas(
          ordenadas.slice(0, 10)
        );

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1>Cargando minutas...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-4xl font-bold">
          Minutas
        </h1>

        {/* Botón agregar */}
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold transition"
          onClick={() =>
            setOpenAddModal(true)
          }
        >
          + Agregar minuta
        </button>
      </div>

      {/* Lista de minutas */}
      <div className="space-y-6">
        {minutas.map((minuta) => (
          <div
            key={minuta.id}
            className="bg-white rounded-xl shadow-md p-6 border"
          >
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-500">
                  ID: {minuta.id}
                </div>

                <h2 className="text-2xl font-bold">
                  Reunión{" "}
                  {new Date(
                    minuta.fecha
                  ).toLocaleDateString(
                    "es-AR"
                  )}
                </h2>
              </div>

              {/* Botón editar */}
              <button
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition"
                onClick={() =>
                  alert(
                    `Editar minuta ID ${minuta.id}`
                  )
                }
              >
                Editar
              </button>
            </div>

            {/* Participantes */}
            <p className="mb-5">
              <strong>
                Participantes:
              </strong>{" "}
              {minuta.participantes}
            </p>

            {/* Temas tratados */}
            <div>
              <h3 className="font-bold text-lg mb-2">
                Temas tratados
              </h3>
                <div
                  className="minuta-html"
                  dangerouslySetInnerHTML={{
                  __html: minuta.temasTratados,
                  }}
                />
              {/*<div className="whitespace-pre-line leading-8">
                {minuta.temasTratados}
              </div>*/}
            </div>
          </div>
        ))}
      </div>

      {/* Modal agregar */}
      {openAddModal && (
        <AddMinutaForm
          onClose={() =>
            setOpenAddModal(false)
          }
          onSave={(nuevaMinuta) => {
            console.log(
              nuevaMinuta
            );

            setOpenAddModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Minutas;