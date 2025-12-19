import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

import Login from "./pages/Login";
import Index from "./pages/Index";
import NovaColeta from "./pages/NovaColeta";
import Execucoes from "./pages/Execucoes";
import Produtos from "./pages/Produtos";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nova-coleta"
        element={
          <ProtectedRoute>
            <NovaColeta />
          </ProtectedRoute>
        }
      />

      <Route
        path="/execucoes"
        element={
          <ProtectedRoute>
            <Execucoes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/produtos"
        element={
          <ProtectedRoute>
            <Produtos />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
