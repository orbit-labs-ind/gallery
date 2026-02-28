import { Routes, Route } from "react-router-dom";
import LandingLayout from "./components/layout/LandingLayout";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ImgPage from "./pages/imgPage";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="images/:id"
          element={
            <ProtectedRoute>
              <ImgPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;