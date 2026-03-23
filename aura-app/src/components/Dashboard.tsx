import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bem-vindo!</h1>
        <button
          onClick={handleLogout}
          className="logout-button"
          disabled={isLoading}
        >
          {isLoading ? "Saindo..." : "Sair"}
        </button>
      </header>

      <main className="dashboard-content">
        <div className="user-info">
          <p>
            Logado como: <strong>{user?.email}</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
