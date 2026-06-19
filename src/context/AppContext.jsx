import { createContext, useState, useEffect, useContext } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [datosGlobales, setDatosGlobales] = useState({
    agenda: [],
    asistentes: [],
    comisiones: [],
    tutorias: [],
    tareas: []
  });
  const [loading, setLoading] = useState(true);

  const API_URL = "https://script.google.com/macros/s/AKfycbxqjX-3Z2B6bzE95F8Wc-4QU8lvS9K15XnQmI-2cdCXtKiYsnVJ8MfBdbBaZumVLM9R4A/exec";

  // Carga inicial ÚNICA para todo el sistema
  const refreshDatos = async (silencioso = false) => {
    try {
      if (!silencioso) {
        setLoading(true);
      }
      
      const res = await fetch(API_URL);
      const data = await res.json();
      
      setDatosGlobales({
        agenda: data.agenda || data.agenda_semanal || [],
        asistentes: data.asistentes || [],
        comisiones: data.comisiones || [],
        tutorias: data.tutorias || [],
        tareas: data.tareas || []
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
      tareas: prev.tareas.map(t => t.id === tareaModificada.id ? tareaModificada : t)
    }));
  };

  const eliminarTareaLocal = (idEliminado) => {
    setDatosGlobales(prev => ({
      ...prev,
      tareas: prev.tareas.filter(t => t.id !== idEliminado)
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
      eliminarTareaLocal
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}