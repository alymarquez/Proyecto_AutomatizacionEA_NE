import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Users, 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Loader2 
} from "lucide-react";

const isoATexto = (fechaStr) => {
  if (!fechaStr) return "";
  if (fechaStr.includes("/")) {
    const partes = fechaStr.split("/");
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
  }
  if (fechaStr.includes("T")) {
    return fechaStr.split("T")[0];
  }
  return fechaStr;
};

const textoAIso = (fechaStr) => {
  if (!fechaStr) return "";
  if (fechaStr.includes("-")) {
    const partes = fechaStr.split("-");
    if (partes.length === 3) {
      const [anio, mes, dia] = partes;
      return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anio}`;
    }
  }
  return fechaStr;
};

export default function AdminUsuarios() {
  const { usuarios = [], refreshDatos, API_URL } = useApp();

  // Estados locales para filtros y búsquedas
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");

  // Estados para modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Cargas internas
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    id_usuarios: "",
    apellido: "",
    nombre: "",
    email: "",
    rol: "Asistente",
    dni: "",
    tel: "",
    carrera_1: "",
    carrera_2: "",
    desde: "",
    hasta: "",
    activo: "TRUE"
  });

  // Filtrado optimizado por nombre, apellido o email
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usr) => {
      const nombreCompleto = `${usr.nombre || ""} ${usr.apellido || ""}`.toLowerCase();
      const emailUsr = (usr.email || "").toLowerCase();
      const query = busqueda.toLowerCase();

      const coincideBusqueda = nombreCompleto.includes(query) || emailUsr.includes(query);
      const coincideRol =
        filtroRol === "todos" || (usr.rol && usr.rol.toLowerCase() === filtroRol.toLowerCase());

      return coincideBusqueda && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  // Generar ID correlativo simple si no existe
  const obtenerSiguienteId = () => {
    if (!usuarios.length) return 1;
    const maxId = usuarios.reduce((max, u) => {
      const idNum = parseInt(u.id_usuarios || u.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);
    return maxId + 1;
  };

  // Manejo de apertura de modales
  const abrirModalCrear = () => {
    const hoyISO = new Date().toISOString().split("T")[0]; // formato YYYY-MM-DD para el input
    setFormData({
      id_usuarios: obtenerSiguienteId(),
      apellido: "",
      nombre: "",
      email: "",
      rol: "Asistente",
      dni: "",
      tel: "",
      carrera_1: "",
      carrera_2: "",
      desde: hoyISO,
      hasta: "",
      activo: "TRUE"
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario) => {
    // Normalizar valor activo (soporta booleanos o strings 'TRUE'/'FALSE')
    let valorActivo = "TRUE";
    if (usuario.activo === false || usuario.activo === "FALSE" || usuario.activo === "inactivo") {
      valorActivo = "FALSE";
    }

    setFormData({
      id_usuarios: usuario.id_usuarios || usuario.id || "",
      apellido: usuario.apellido || "",
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      rol: usuario.rol || "Asistente",
      dni: usuario.dni || "",
      tel: usuario.tel || "",
      carrera_1: usuario.carrera_1 || "",
      carrera_2: usuario.carrera_2 || "",
      desde: isoATexto(usuario.desde),
      hasta: isoATexto(usuario.hasta),
      activo: valorActivo
    });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const abrirModalEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalEliminar(true);
  };

  // Enviar formulario (Crear / Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const payload = {
      accion: modoEdicion ? "editar_usuario" : "crear_usuario",
      ...formData,
      desde: textoAIso(formData.desde),
      hasta: textoAIso(formData.hasta)
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (data.ok) {
        await refreshDatos(true);
        setModalAbierto(false);
      } else {
        alert("Error: " + (data.mensaje || "No se pudo procesar la solicitud"));
      }
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      alert("Error de conexión al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar eliminación
  const handleEliminar = async () => {
    if (!usuarioSeleccionado) return;
    setEliminando(true);

    const targetId = usuarioSeleccionado.id_usuarios || usuarioSeleccionado.id;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          accion: "eliminar_usuario",
          id_usuarios: targetId,
          id: targetId
        })
      });
      
      const data = await res.json();

      if (data.ok) {
        await refreshDatos(true);
        setModalEliminar(false);
        setUsuarioSeleccionado(null);
      } else {
        alert("Error: " + (data.mensaje || "No se pudo eliminar el usuario"));
      }
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("Error de conexión al eliminar.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 tracking-tight">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Administra roles, accesos y datos del equipo institucional
          </p>
        </div>

        <button
          onClick={abrirModalCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-5 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-400">Rol:</label>
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 capitalize"
          >
            <option value="todos">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Asistente">Asistente</option>
            <option value="Docente">Docente</option>
          </select>
        </div>
      </div>

      {/* TARJETAS DE USUARIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {usuariosFiltrados.length > 0 ? (
          usuariosFiltrados.map((usr, i) => {
            const idUnico = usr.id_usuarios || usr.id || i;
            const esActivo =
              usr.activo === true ||
              usr.activo === "TRUE" ||
              usr.activo === "activo";

          return (
            <div
              key={idUnico}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
            >
          {/* CABECERA */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-400 font-bold">
                #{usr.id_usuarios || usr.id || "-"}
              </span>

              {!esActivo ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                  <XCircle className="w-3 h-3" />
                  Inactivo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" />
                  Activo
                </span>
              )}
            </div>

          {/* CONTENIDO */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

              {/* DATOS PERSONALES */}
              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <div>
                  <p className="font-bold text-slate-800">
                    {usr.apellido || ""} {usr.nombre || "Sin nombre"}
                  </p>

                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {usr.email || "Sin email"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p>
                    <strong>DNI:</strong> {usr.dni || "-"}
                  </p>

                  <p>
                    <strong>Tel:</strong> {usr.tel || "-"}
                  </p>
                </div>
              </div>

              {/* ROL */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 mb-2">
                  Rol
                </h4>

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                    (usr.rol || "").toLowerCase().includes("admin")
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : (usr.rol || "").toLowerCase().includes("docente")
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {(usr.rol || "").toLowerCase().includes("admin") && (
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                  )}

                  {usr.rol || "Asistente"}
                </span>
              </div>

              {/* CARRERA */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 mb-2">
                  Carrera
                </h4>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 min-h-[45px] flex items-center">
                  <div className="text-xs text-slate-600 space-y-1">
                    {usr.carrera_1 && (
                      <p>{usr.carrera_1}</p>
                    )}

                    {usr.carrera_2 && (
                      <p>{usr.carrera_2}</p>
                    )}

                    {!usr.carrera_1 && !usr.carrera_2 && (
                      <p>-</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ACCIONES */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => abrirModalEditar(usr)}
                  title="Editar usuario"
                  className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => abrirModalEliminar(usr)}
                  title="Eliminar usuario"
                  className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
          );
        })
        ) : (
          <div className="col-span-full text-center py-8 text-slate-400 italic text-xs">
            No se encontraron usuarios coincidentes.
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-black text-slate-800">
              {modoEdicion ? `Editar Usuario #${formData.id_usuarios}` : "Crear Nuevo Usuario"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Ej: Romero"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Florencia"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="florencia@unahur.edu.ar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">DNI</label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    placeholder="Ej: 32556068"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.tel}
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                    placeholder="Ej: 1158532403"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Rol</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Asistente">Asistente</option>
                    <option value="Docente">Docente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Estado</label>
                  <select
                    value={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  >
                    <option value="TRUE">Activo</option>
                    <option value="FALSE">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Carrera Principál (1)</label>
                <input
                  type="text"
                  value={formData.carrera_1}
                  onChange={(e) => setFormData({ ...formData, carrera_1: e.target.value })}
                  placeholder="Ej: Licenciada en cs de la educación"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Carrera Secundaria (2)</label>
                <input
                  type="text"
                  value={formData.carrera_2}
                  onChange={(e) => setFormData({ ...formData, carrera_2: e.target.value })}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Desde</label>
                  <input
                    type="date"
                    value={formData.desde}
                    onChange={(e) => setFormData({ ...formData, desde: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={formData.hasta}
                    onChange={(e) => setFormData({ ...formData, hasta: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modoEdicion ? "Guardar Cambios" : "Crear Usuario"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminar && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <h2 className="text-base font-black text-slate-800">¿Eliminar Usuario?</h2>
            <p className="text-xs text-slate-500">
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong className="text-slate-800">
                {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
              </strong>
              ? Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModalEliminar(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {eliminando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}