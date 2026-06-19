import CalendarioAsistentes from "../components/CalendarioAsistentes";
import { Sparkles } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased">
      
      {/* BANNER */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-800/40">
          
          {/* Efecto decorativo de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-start gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
              <Sparkles className="w-3 h-3" /> Espacio Organizativo
            </div>

            <h1 className="text-xl md:text-3xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-100">
              ¡Hola, equipo de estudiantes asistentes!
            </h1>
            
            <p className="text-slate-300 text-xs md:text-sm font-medium max-w-xl leading-relaxed tracking-tight">
              Página organizativa para el seguimiento, control y acompañamiento diario de <strong className="text-indigo-200">NE / CADU</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* CALENDARIO */}
      <main className="py-6 flex-1">
        <CalendarioAsistentes />
      </main>
    </div>
  );
}

export default Home;