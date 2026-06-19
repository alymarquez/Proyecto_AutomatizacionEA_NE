import logo from "../assets/logone.png";
import { ExternalLink, Calendar, GraduationCap, Globe } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* PARTE SUPERIOR */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">

          {/* LOGO + TEXTO IDENTITARIO */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-1.5 bg-slate-800 rounded-xl border border-slate-700/50">
              <img
                src={logo}
                alt="Logo NE"
                className="w-12 h-12 object-contain brightness-110"
              />
            </div>

            <div className="text-center md:text-left space-y-0.5">
              <h2 className="text-base font-black text-white tracking-tight">
                NE Estudiantes Asistentes
              </h2>
              <p className="text-xs text-indigo-400 font-bold tracking-wide uppercase">
                UNAHUR · Nuevos Entornos
              </p>
            </div>
          </div>

          {/* LINKS DE ACCESO RÁPIDO */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2.5">
            
            <a
              href="https://unahur.edu.ar/calendario-academico/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition shadow-3xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Calendario Académico</span>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </a>

            <a
              href="https://campus2026.unahur.edu.ar/login/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition shadow-3xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>Docentes Web</span>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </a>

            <a
              href="https://nativo.unahur.edu.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition shadow-3xs"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Nativo</span>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </a>

          </div>
        </div>

        {/* LÍNEA DIVISORIA */}
        <div className="border-t border-slate-800/70 my-6"></div>

        {/* COPYRIGHT */}
        <div className="text-center text-[11px] font-bold text-slate-500 tracking-wider uppercase">
          © 2026 NE Estudiantes Asistentes · Universidad Nacional de Hurlingham
        </div>
      </div>
    </footer>
  );
}

export default Footer;