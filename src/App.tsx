import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import NotesPage from "./pages/NotesPage";
import NoteEditorPage from "./pages/NoteEditorPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

type AuthPage = "register" | "login";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg)",
          color: "var(--text-h)",
          fontSize: "18px",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AuthRoutes() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<AuthPage>("login");

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "black",
          color: "white",
          fontSize: "18px",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/notes" replace />;
  }

  return (
    <div>
      {currentPage === "login" && (
        <LoginForm onGoToRegister={() => setCurrentPage("register")} />
      )}
      {currentPage === "register" && (
        <RegisterForm onGoToLogin={() => setCurrentPage("login")} />
      )}
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoutes />} />
      <Route path="/register" element={<AuthRoutes />} />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/new"
        element={
          <ProtectedRoute>
            <NoteEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>
            <NoteEditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
