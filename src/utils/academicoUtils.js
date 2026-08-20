// Funciones auxiliares para el módulo de Gestión Académica (Comisiones y Tutorías)

// Mapea un ID de Docente a su Nombre y Apellido buscando en la lista de usuarios
export const obtenerNombreDocente = (docenteId, listaUsuarios) => {
  if (!docenteId) return "Sin asignar";

  // Buscar por id o id_usuario
  const usuario = listaUsuarios.find(
    (u) => String(u.id || u.id_usuarios) === String(docenteId)
  );

  if (usuario) {
    return `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
  }

  // Si no se encuentra en el listado, retorna el valor original
  return docenteId;
};

// Normaliza horarios que pueden llegar en formato ISO (ej: "1899-12-30T20:16:48.000Z") a "HH:mm"
export const formatearHora = (horaRaw) => {
  if (!horaRaw) return "";
  const str = String(horaRaw);

  if (str.includes("T")) {
    const fechaObj = new Date(str);
    if (!isNaN(fechaObj.getTime())) {
      const horas = String(fechaObj.getHours()).padStart(2, "0");
      const minutos = String(fechaObj.getMinutes()).padStart(2, "0");
      return `${horas}:${minutos}`;
    }
  }
  return str;
};

// Genera el siguiente ID correlativo disponible en una lista de registros
export const obtenerSiguienteId = (lista, campoId) => {
  if (!lista.length) return 1;
  const maxId = lista.reduce((max, item) => {
    const idNum = parseInt(item[campoId] || item.id, 10);
    return !isNaN(idNum) && idNum > max ? idNum : max;
  }, 0);
  return maxId + 1;
};

// Determina si un registro está activo
export const esRegistroActivo = (valor) =>
  valor === true || valor === "TRUE" || valor === "activo";
