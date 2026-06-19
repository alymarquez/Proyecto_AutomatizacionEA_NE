import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Minutas from "./pages/Minutas";
import Comisiones from "./pages/Comisiones";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="minutas" element={<Minutas />} />
            <Route path="comisiones" element={<Comisiones />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;