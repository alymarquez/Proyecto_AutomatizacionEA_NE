import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logone.png";
import { 
  Home as HomeIcon, 
  BookOpen, 
  Users2, 
  ClipboardList, 
  Menu, 
  X,
  Kanban
} from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkStyles = (path) => `
    flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black tracking-tight transition duration-200 border
    ${isActive(path) 
      ? "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-3xs" 
      : "text-slate-600 hover:text-indigo-600 bg-transparent border-transparent hover:bg-slate-50"
    }
  `;

  const mobileLinkStyles = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition border
    ${isActive(path)
      ? "bg-indigo-50 text-indigo-600 border-indigo-100"
      : "text-slate-600 hover:bg-slate-50 border-transparent"
    }
  `;

  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-md shadow-2xs relative z-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20">

          {/* LOGO + NOMBRE */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-150 group-hover:scale-105 transition">
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">
                NE / CADU
              </h1>
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase mt-1 hidden sm:block">
                Estudiantes Asistentes
              </span>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link to="/" className={linkStyles("/")}>
              <HomeIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Inicio</span>
            </Link>

            <Link to="/tareas" className={linkStyles("/tareas")}>
              <Kanban className="w-3.5 h-3.5 shrink-0" />
              <span>Tareas</span>
            </Link>

            <Link to="/tutorias" className={linkStyles("/tutorias")}>
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Tutorías</span>
            </Link>

            <Link to="/comisiones" className={linkStyles("/comisiones")}>
              <Users2 className="w-3.5 h-3.5 shrink-0" />
              <span>Comisiones</span>
            </Link>

            <Link to="/minutas" className={linkStyles("/minutas")}>
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span>Minutas</span>
            </Link>
          </div>

          {/* BOTÓN HAMBURGUESA MOBILE */}
          <button
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/60 transition active:scale-95"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* MENU MOBILE DESPLEGABLE */}
      {menuOpen && (
        <div className="absolute top-[80px] left-0 w-full bg-white border-b border-slate-200 shadow-xl md:hidden z-50">
          <div className="flex flex-col p-4 space-y-1 bg-slate-50/50">
            
            <Link
              to="/"
              className={mobileLinkStyles("/")}
              onClick={() => setMenuOpen(false)}
            >
              <HomeIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Inicio</span>
            </Link>

            <Link
              to="/tareas"
              className={mobileLinkStyles("/tareas")}
              onClick={() => setMenuOpen(false)}
            >
              <Kanban className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Tareas</span>
            </Link>

            <Link
              to="/tutorias"
              className={mobileLinkStyles("/tutorias")}
              onClick={() => setMenuOpen(false)}
            >
              <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Tutorías</span>
            </Link>

            <Link
              to="/comisiones"
              className={mobileLinkStyles("/comisiones")}
              onClick={() => setMenuOpen(false)}
            >
              <Users2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Comisiones</span>
            </Link>

            <Link
              to="/minutas"
              className={mobileLinkStyles("/minutas")}
              onClick={() => setMenuOpen(false)}
            >
              <ClipboardList className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Minutas</span>
            </Link>

          </div>
        </div>
      )}

      {/* DETALLE ESTÉTICO ABAJO */}
      <div className="h-[3px] w-full bg-gradient-to-r from-slate-950 via-indigo-600 to-indigo-950" />

    </nav>
  );
}

export default Navbar;