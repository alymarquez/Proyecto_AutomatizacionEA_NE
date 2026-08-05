import React, { useState } from "react";
import { Users, BookOpen, Layers, Settings } from "lucide-react";

import AdminUsuarios from "../components/AdminUsuarios";

export default function Admin() {
  const [seccionActiva, setSeccionActiva] = useState("usuarios");

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* CABECERA DEL PANEL */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-xs font-semibold text-slate-400">
              Gestiona usuarios, comisiones y configuración del sistema
            </p>
          </div>
        </div>

        {/* BARRA DE NAVEGACIÓN (TABS) */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setSeccionActiva("usuarios")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
              seccionActiva === "usuarios"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios</span>
          </button>

          <button
            onClick={() => setSeccionActiva("comisiones")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
              seccionActiva === "comisiones"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/60"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Comisiones</span>
          </button>

          <button
            onClick={() => setSeccionActiva("tutorias")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
              seccionActiva === "tutorias"
                ? "border-indigo-600 text-indigo-600 bg-white"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tutorías</span>
          </button>
        </div>

        {/* CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
        <div className="pt-2">
          {seccionActiva === "usuarios" && <AdminUsuarios />}
          
          {seccionActiva === "comisiones" && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-medium">
              Próximamente: Módulo de Gestión de Comisiones
            </div>
          )}

          {seccionActiva === "tutorias" && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-medium">
              Próximamente: Módulo de Gestión de Tutorías
            </div>
          )}
        </div>

      </div>
    </div>
  );
}