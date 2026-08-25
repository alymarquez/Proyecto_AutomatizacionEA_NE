import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthorizationProvider } from "./context/AuthorizationContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Minutas from "./pages/Minutas";
import Comisiones from "./pages/Comisiones";
import TareasTablero from "./pages/TareasTablero";
import Tutorias from "./pages/Tutorias";
import Admin from "./pages/Admin";
import RequireRole from "./components/RequireRole";


function App() {
  return (
    <AppProvider>
    <AuthProvider>
    
      <AuthorizationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="minutas" element={<Minutas />} />
            <Route path="comisiones" element={<Comisiones />} />
            <Route path="tareas" element={<TareasTablero />} />
            <Route path="tutorias" element={<Tutorias />} />
            <Route
              path="/admin"
              element={
                <RequireRole roles={["Administrador"]}>
                  <Admin />
                </RequireRole>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthorizationProvider>
    
    </AuthProvider>
    </AppProvider>
  );
}

export default App;
