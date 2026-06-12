import { useEffect, useState } from "react";
// Importamos los íconos profesionales de Lucide
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Clock,
  Mail,
  User,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

function CalendarioAsistentes() {
  const [data, setData] = useState({
    comisiones_fijas: [],
    agenda_semanal: [],
  });
  const [loading, setLoading] = useState(true);

  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycbx0iIxF8LMorbiqB_ilUVx_-ehNHAOc-TrZfaKuYgjwFB7NLg8T3DNBeIhg_zK7RaK8cQ/exec",
    )
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando el calendario:", error);
        setLoading(false);
      });
  }, []);

  const año = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const primerDiaIndex = new Date(año, mes, 1).getDay();
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const ajustePrimerDia = primerDiaIndex === 0 ? 6 : primerDiaIndex - 1;

  const celdasCalendario = [];
  for (let i = 0; i < ajustePrimerDia; i++) {
    celdasCalendario.push(null);
  }
  for (let d = 1; d <= diasEnMes; d++) {
    celdasCalendario.push(new Date(año, mes, d));
  }

  const obtenerEventosDelDia = (fechaCelda) => {
    if (!fechaCelda) return [];

    const yyyy = fechaCelda.getFullYear();
    const mm = String(fechaCelda.getMonth() + 1).padStart(2, "0");
    const dd = String(fechaCelda.getDate()).padStart(2, "0");
    const stringCelda = `${yyyy}-${mm}-${dd}`;

    return data.agenda_semanal.filter((item) => {
      const fechaItem = item.fecha_dia || item.fecha || "";
      return (
        fechaItem.includes(stringCelda) || fechaItem === `${dd}/${mm}/${yyyy}`
      );
    });
  };

  const cambiarMes = (direccion) => {
    setFechaActual(new Date(año, mes + direccion, 1));
    setDiaSeleccionado(null);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 font-medium tracking-wide">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <span>Sincronizando calendario organizativo...</span>
      </div>
    );

  console.log(data.agenda_semanal);

  return (
    <div className="max-w-6xl mx-auto p-3 bg-slate-50/50 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
      {/* CONTROLES DE NAVEGACIÓN */}
      <div className="flex justify-between items-center mb-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CalendarDays className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            {nombresMeses[mes]}{" "}
            <span className="text-slate-400 font-normal">{año}</span>
          </h2>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => cambiarMes(-1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => cambiarMes(1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GRILLA MENSUAL */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Encabezado días */}
        <div className="grid grid-cols-7 bg-slate-800 text-slate-200 text-center font-semibold text-[11px] py-2 uppercase tracking-wider">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mié</div>
          <div>Jue</div>
          <div>Vie</div>
          <div>Sáb</div>
          <div>Dom</div>
        </div>

        {/* Celdas */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50">
          {celdasCalendario.map((fechaCelda, index) => {
            const eventos = obtenerEventosDelDia(fechaCelda);
            const esHoy =
              fechaCelda &&
              fechaCelda.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                onClick={() => fechaCelda && setDiaSeleccionado(fechaCelda)}
                className={`min-h-[78px] max-h-[82px] p-1.5 bg-white transition-all flex flex-col justify-between cursor-pointer relative ${
                  !fechaCelda
                    ? "bg-slate-50/40 cursor-default"
                    : "hover:bg-slate-50"
                } ${esHoy ? "bg-emerald-50/40 border-2 border-emerald-400 z-10" : ""}`}
              >
                {/* Número de día */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-bold ${
                      esHoy
                        ? "bg-emerald-500 text-white px-1.5 py-0.5 rounded-md shadow-xs"
                        : "text-slate-400"
                    }`}
                  >
                    {fechaCelda ? fechaCelda.getDate() : ""}
                  </span>
                  {eventos.length > 0 && !esHoy && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  )}
                </div>

                {/* Eventos */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {eventos.slice(0, 2).map((ev, i) => {
                    const esTutoria = ev.tipo
                      ?.toLowerCase()
                      .includes("tutoria");
                    return (
                      <div
                        key={i}
                        className={`text-[9px] px-1 py-0.5 rounded font-medium truncate border ${
                          esTutoria
                            ? "bg-purple-50 text-purple-700 border-purple-200/60" // Violeta/Lavanda Pastel
                            : "bg-blue-50 text-blue-700 border-blue-200/60" // Azul Pastel
                        }`}
                      >
                        <span className="font-bold">{ev.asistente_real}</span>:{" "}
                        {ev.nombre}
                      </div>
                    );
                  })}
                  {eventos.length > 2 && (
                    <div className="text-[8px] text-slate-400 text-center font-medium bg-slate-50 rounded py-0.2">
                      + {eventos.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL DETALLE DE ASISTENCIA PRESENCIAL */}
      {diaSeleccionado && (
        <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-500" />
              Cobertura Presencial del{" "}
              {diaSeleccionado.toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <button
              onClick={() => setDiaSeleccionado(null)}
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-md transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {obtenerEventosDelDia(diaSeleccionado).length > 0 ? (
              obtenerEventosDelDia(diaSeleccionado).map((item, idx) => {
                const esTutoria = item.tipo?.toLowerCase().includes("tutoria");
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${
                            esTutoria
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {item.aula ? `AULA ${item.aula}` : "LABORATORIO"}
                        </span>
                        <strong className="text-slate-800 text-sm">
                          {item.nombre}
                        </strong>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />{" "}
                          {item.horario}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> Prof:{" "}
                          {item.docente}
                        </span>
                        {item.docente_mail && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Mail className="w-3 h-3" /> {item.docente_mail}
                          </span>
                        )}
                      </div>

                      {item.notas && (
                        <div className="flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 px-2 py-1 rounded-md border border-amber-200/70 w-fit mt-1">
                          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{item.notas}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right min-w-[140px] shadow-2xs shrink-0">
                      <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">
                        Asistente
                      </span>
                      <span className="font-bold text-slate-700 text-sm">
                        {item.asistente_real}
                      </span>
                      <span
                        className={`block text-[9px] font-semibold ${item.estado === "Oficial" ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {item.estado}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                No hay comisiones asignadas para este día.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarioAsistentes;
