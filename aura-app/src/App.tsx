import { useState } from "react";
import "./App.css";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

type AppPage = "register" | "login";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>("login");

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
    return <Dashboard />;
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
