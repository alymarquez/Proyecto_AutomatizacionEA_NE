import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logone.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-green-600 text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-24">

          {/* Logo + nombre */}
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Logo"
              className="w-16 h-16 object-contain"
            />

            <h1 className="text-2xl font-bold hidden sm:block">
              NE Estudiantes Asistentes
            </h1>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex gap-8 text-lg font-medium">
            <a
              href="/"
              className="transition duration-300 hover:text-cyan-300 font-bold"
            >
              Inicio
            </a>

            <a
              href="/tutorias"
              className="transition duration-300 hover:text-cyan-300 font-bold"
            >
              Tutorías
            </a>

            <a
              href="/comisiones"
              className="transition duration-300 hover:text-cyan-300 font-bold"
            >
              Comisiones
            </a>

            <Link className="transition duration-300 hover:text-cyan-300 font-bold" to="/minutas">Minutas</Link>
            
          </div>

          {/* BOTÓN HAMBURGUESA */}
          <button
            className="md:hidden text-4xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MENU MOBILE FLOTANTE */}
      {menuOpen && (
        <div className="absolute top-24 left-0 w-full bg-green-700 shadow-xl md:hidden z-50">

          <div className="flex flex-col px-6 py-5 text-lg font-medium">

            <a
              href="/"
              className="py-3 border-b border-green-500 hover:text-cyan-300 transition"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </a>

            <a
              href="/tutorias"
              className="py-3 border-b border-green-500 hover:text-cyan-300 transition"
              onClick={() => setMenuOpen(false)}
            >
              Tutorías
            </a>

            <a
              href="/comisiones"
              className="py-3 border-b border-green-500 hover:text-cyan-300 transition"
              onClick={() => setMenuOpen(false)}
            >
              Comisiones
            </a>

            <a
              href="/minutas"
              className="py-3 hover:text-cyan-300 transition"
              onClick={() => setMenuOpen(false)}
            >
              Minutas
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;