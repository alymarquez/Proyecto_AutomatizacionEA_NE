import { formatearHora } from "./academicoUtils";

export const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Parsea "YYYY-MM-DD" a un Date en horario LOCAL
export const parsearFechaLocal = (fechaStr) => {
  if (!fechaStr) return null;
  const [y, m, d] = fechaStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// Formatea un Date a "DD/MM/YYYY"
export const formatearFechaDDMMYYYY = (fecha) => {
  const dd = String(fecha.getDate()).padStart(2, "0");
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const yyyy = fecha.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const normalizarTexto = (texto) =>
  String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

export const obtenerFechasPorDia = (fechaInicio, fechaFin, diaTexto) => {
  if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) return [];

  const indiceDia = DIAS_SEMANA.findIndex(
    (d) => normalizarTexto(d) === normalizarTexto(diaTexto)
  );
  if (indiceDia === -1) return [];

  const fechas = [];
  const cursor = new Date(fechaInicio);

  while (cursor.getDay() !== indiceDia) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor > fechaFin) return fechas;
  }

  while (cursor <= fechaFin) {
    fechas.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }

  return fechas;
};

export const calcularNumeroSemana = (fecha, fechaInicio) => {
  const msPorDia = 24 * 60 * 60 * 1000;
  const diffDias = Math.round((fecha - fechaInicio) / msPorDia);
  return Math.floor(diffDias / 7) + 1;
};

// Construye la lista de eventos a partir de la configuración del cuatrimestre.
export const generarEventosCuatrimestre = ({ fechaInicio, fechaFin, comisiones = [], tutorias = [], reunion = null }) => {
  const eventos = [];

  // COMISIONES
  comisiones.forEach((c) => {
    console.log("COMISION:", c.id_comisiones, c.nro_comision, JSON.stringify(c.dia));

    const fechas = obtenerFechasPorDia(fechaInicio, fechaFin, c.dia);

    console.log("FECHAS GENERADAS:", fechas);
    fechas.forEach((fecha) => {
      eventos.push({
        fecha: formatearFechaDDMMYYYY(fecha),
        semana: calcularNumeroSemana(fecha, fechaInicio),
        tipo: "Comision",
        referencia_id: c.id_comisiones || c.id,
        asistente_id: (c.asistentes || []).join(";"),
        titulo: `Comisión N° ${c.nro_comision}`,
        detalle: "",
        estado: "",
        hora: `${formatearHora(c.hora_desde)} a ${formatearHora(c.hora_hasta)}`,
        aula: c.aula
      });
    });
  });

  // TUTORÍAS
  tutorias.forEach((t) => {
    const fechas = obtenerFechasPorDia(fechaInicio, fechaFin, t.dia);
    fechas.forEach((fecha) => {
      eventos.push({
        fecha: formatearFechaDDMMYYYY(fecha),
        semana: calcularNumeroSemana(fecha, fechaInicio),
        tipo: "Tutoria",
        referencia_id: t.id_tutorias || t.id,
        asistente_id: (t.asistentes || []).join(";"),
        titulo: "Tutoría",
        detalle: "",
        estado: "",
        hora: formatearHora(t.horario),
        aula: t.aula
      });
    });
  });

  // REUNIÓN DE EQUIPO (semanal, fija)
  if (reunion && reunion.incluir) {
    const fechas = obtenerFechasPorDia(fechaInicio, fechaFin, reunion.dia);
    fechas.forEach((fecha) => {
      eventos.push({
        fecha: formatearFechaDDMMYYYY(fecha),
        semana: calcularNumeroSemana(fecha, fechaInicio),
        tipo: "Reunion",
        referencia_id: "",
        asistente_id: (reunion.asistentes || []).join(";"),
        titulo: reunion.titulo || "Reunión de equipo",
        detalle: "",
        estado: "",
        hora: `${reunion.hora_desde} a ${reunion.hora_hasta}`,
        aula: reunion.aula
      });
    });
  }

  // Orden cronológico
  return eventos.sort((a, b) => {
    const [da, ma, ya] = a.fecha.split("/").map(Number);
    const [db, mb, yb] = b.fecha.split("/").map(Number);
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  });
};
