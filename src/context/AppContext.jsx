import { createContext, useState, useEffect, useContext } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [datosGlobales, setDatosGlobales] = useState({
    eventos: [],
    usuarios: [],
    comisiones: [],
    tutorias: [],
    tareas: [],
    minutas: [],
    totalMinutas: 0,
    paginaMinutas: 1,
  });
  const [loading, setLoading] = useState(true);

  const API_URL = "https://script.google.com/macros/s/AKfycbwJpkMBS-3n5GkyOlEd8aOJD4Y_0MF1Ip00weO_jaO17wNZB2Zh-peZv8Vwy5x_pKYd_A/exec";

  // Carga inicial ÚNICA para todo el sistema
  const refreshDatos = async (
    silencioso = false,
    pagina = 1) => {
    try {
      if (!silencioso) {
        setLoading(true);
      }
      
      const res = await fetch(`${API_URL}?page=${pagina}`);
      const data = await res.json();

      
      
      setDatosGlobales({
        eventos: data.eventos || [],
        usuarios: data.usuarios || [],
        comisiones: data.comisiones || [],
        tutorias: data.tutorias || [],
        tareas: data.tareas || [],
        calendario: data.calendario || [],      
        minutas: data.minutas.minutas || [],
        totalMinutas: data.minutas.total || 0,
        paginaMinutas: 1,
      });
    } catch (err) {
      console.error("Error crítico cargando estado global:", err);
    } finally {
      setLoading(false);
    }
  };

  // La primera carga de la app usa el loading tradicional
  useEffect(() => {
    refreshDatos(false);
  }, []);

  // Funciones optimizadas para actualizar el estado de tareas localmente AL INSTANTE
  const agregarTareaLocal = (nuevaTarea) => {
    setDatosGlobales(prev => ({ ...prev, tareas: [...prev.tareas, nuevaTarea] }));
  };

  const editarTareaLocal = (tareaModificada) => {
    setDatosGlobales(prev => ({
      ...prev,
      tareas: prev.tareas.map(t => Number(t.id_tareas) === Number(tareaModificada.id_tareas) ? tareaModificada : t)
    }));
  };

  const eliminarTareaLocal = (idEliminado) => {
    setDatosGlobales(prev => ({
      ...prev,
      tareas: prev.tareas.filter(t => Number(t.id_tareas) !== Number(idEliminado))
    }));
  };

  const actualizarEventoLocal = (eventoActualizado) => {
  setDatosGlobales(prev => ({
    ...prev,
    eventos: prev.eventos.map(evento =>
      Number(evento.id_calendario) === Number(eventoActualizado.id_calendario)
        ? {
            ...evento,
            asistente_id: eventoActualizado.asistente_id
          }
        : evento
    )
  }));
};

const editarEvento = async (datos) => {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      accion: "editarEvento",
      ...datos
    })
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error);
  }

  await refreshDatos(true);

  return result;
};

const agregarMinutaLocal = (nuevaMinuta) => {
  setDatosGlobales(prev => ({
    ...prev,
    minutas: [nuevaMinuta, ...prev.minutas]
  }));
};

const actualizarMinutaLocal = (minutaActualizada) => {
  setDatosGlobales(prev => ({
    ...prev,
    minutas: prev.minutas.map(m =>
      Number(m.id) === Number(minutaActualizada.id)
        ? minutaActualizada
        : m
    )
  }));
};


  return (
    <AppContext.Provider value={{ 
      ...datosGlobales, 
      loading, 
      API_URL, 
      refreshDatos,
      agregarTareaLocal,
      editarTareaLocal,
      eliminarTareaLocal,
      actualizarEventoLocal,
      editarEvento,
      agregarMinutaLocal,
      actualizarMinutaLocal
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}