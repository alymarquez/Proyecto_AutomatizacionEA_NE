import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  iniciarSesionConGoogle,
  cerrarSesion,
} from "../services/AuthServices";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuarioFirebase, setUsuarioFirebase] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const desuscribirse = onAuthStateChanged(auth, (usuario) => {
      setUsuarioFirebase(usuario);
      setAuthLoading(false);
    });

    return () => desuscribirse();
  }, []);

  const loginGoogle = async () => {
    return await iniciarSesionConGoogle();
  };

  const logout = async () => {
    await cerrarSesion();
  };

  return (
    <AuthContext.Provider
      value={{
        usuarioFirebase,
        authLoading,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}