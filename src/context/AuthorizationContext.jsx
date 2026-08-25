import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useApp } from "./AppContext";
import { buscarUsuarioAutorizado } from "../services/AuthServices";

const AuthorizationContext = createContext();

export function AuthorizationProvider({ children }) {
  const { usuarioFirebase, authLoading } = useAuth();
  const { usuarios, loading } = useApp();

  const [usuarioAutorizado, setUsuarioAutorizado] = useState(null);
  const [autorizacionLoading, setAutorizacionLoading] = useState(true);

  useEffect(() => {
    if (authLoading || loading) {
      return;
    }

    setAutorizacionLoading(true);

    if (!usuarioFirebase) {
      setUsuarioAutorizado(null);
      setAutorizacionLoading(false);
      return;
    }

    const usuarioEncontrado = buscarUsuarioAutorizado(
      usuarioFirebase,
      usuarios
    );
    console.log("USUARIO FIREBASE:", usuarioFirebase.email);
console.log("USUARIO AUTORIZADO:", usuarioEncontrado);
console.log("ROL:", usuarioEncontrado?.rol);

    setUsuarioAutorizado(usuarioEncontrado);
    setAutorizacionLoading(false);
  }, [usuarioFirebase, authLoading, usuarios, loading]);

  const autorizado = usuarioAutorizado !== null;

  const rol = usuarioAutorizado?.rol || null;

  const tieneRol = (...rolesPermitidos) => {
    if (!rol) {
      return false;
    }

    return rolesPermitidos.includes(rol);
  };

  return (
    <AuthorizationContext.Provider
      value={{
        usuarioAutorizado,
        autorizado,
        autorizacionLoading,
        rol,
        tieneRol,
      }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
}

export function useAuthorization() {
  return useContext(AuthorizationContext);
}