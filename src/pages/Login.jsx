import { useAuth } from "../context/AuthContext";

const Login = ({ onClose }) => {
  
  const { usuarioFirebase, loginGoogle, logout } = useAuth();

  const iniciarSesionConGoogle = async () => {
    try {
      const usuario = await loginGoogle();

      console.log("Usuario autenticado:", usuario);
      console.log("Email:", usuario.email);

      alert(`Autenticado correctamente: ${usuario.email}`);

      onClose();
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      alert("No se pudo iniciar sesión con Google.");
    }
  };

  const cerrarSesion = async () => {
  try {
    await logout();
    onClose();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("No se pudo cerrar la sesión.");
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        {/* Contenido */}
        <div className="p-8 text-center">
          
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            NE / CADU
          </h1>

          {usuarioFirebase ? (
            <>
              <p className="mb-2 text-gray-600">
                Ya estás autenticado
              </p>

              <p className="mb-6 text-sm text-gray-500">
                {usuarioFirebase.email}
              </p>

              <button
                onClick={cerrarSesion}
                className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <p className="mb-6 text-gray-600">
                Ingresá con tu cuenta de Google
              </p>

              <button
                onClick={iniciarSesionConGoogle}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-800 transition hover:bg-gray-50"
              >
                Continuar con Google
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;