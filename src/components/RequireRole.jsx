import { Navigate } from "react-router-dom";
import { useAuthorization } from "../context/AuthorizationContext";

function RequireRole({ roles, children }) {
  const {
    autorizado,
    autorizacionLoading,
    tieneRol
  } = useAuthorization();

  if (autorizacionLoading) {
    return <div>Cargando...</div>;
  }

  if (!autorizado) {
    return <Navigate to="/" replace />;
  }

  if (!tieneRol(...roles)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">
          Acceso no autorizado
        </h1>

        <p className="mt-2 text-gray-600">
          No tenés permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return children;
}

export default RequireRole;