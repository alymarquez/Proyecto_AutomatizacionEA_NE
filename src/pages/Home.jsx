import CalendarioAsistentes from "../components/CalendarioAsistentes";
import { useApp } from "../context/AppContext";
import { Sparkles, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  const { tareas, loading } = useApp();

  // Filtramos tareas críticas
  const tareasCriticas = tareas.filter((tarea) => {
    if (tarea.columna === "completado") return false;
    if (tarea.prioridad === "alta") return true;

    if (tarea.fecha_limite) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fechaLimite = new Date(
        String(tarea.fecha_limite).split("T")[0]
      );
      fechaLimite.setHours(0, 0, 0, 0);

      const diasRestantes = Math.floor(
        (fechaLimite.getTime() - hoy.getTime()) / 86400000
      );

      if (diasRestantes <= 1) return true;
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased">
      {/* BANNER */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-800/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-start gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
              <Sparkles className="w-3 h-3" /> Espacio Organizativo
            </div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-100">
              ¡Hola, equipo de estudiantes asistentes!
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium max-w-xl leading-relaxed tracking-tight">
              Página organizativa para el seguimiento, control y acompañamiento
              diario de <strong className="text-indigo-200">NE / CADU</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE ALERTAS URGENTES */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {!loading && tareasCriticas.length > 0 && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">
                  Urgente ({tareasCriticas.length})
                </span>
              </div>

              {/* Tarjetitas de Tareas */}
              <div className="flex flex-wrap gap-2">
                {tareasCriticas.map((tarea) => (
                  <Link
                    key={tarea.id_tareas}
                    to="/tareas"
                    className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-rose-200 rounded-lg shadow-sm hover:shadow-md hover:border-rose-400 transition-all duration-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:scale-125 transition-transform" />

                    <span className="text-[10px] font-bold text-rose-900">
                      {tarea.titulo}
                    </span>

                    <span className="text-[8px] font-black text-rose-300 uppercase ml-1 pl-2 border-l border-rose-100">
                      #{tarea.id_tareas}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CALENDARIO */}
      <main className="py-6 flex-1">
        <CalendarioAsistentes />
      </main>
    </div>
  );
}

export default Home;
