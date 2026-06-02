import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Minutas from "./pages/Minutas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="minutas" element={<Minutas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;