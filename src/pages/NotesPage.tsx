import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Popconfirm, Modal, Input, message, Alert } from "antd";
import { getNotes, deleteNote } from "../services/notesService";
import {
  getPastas,
  createPasta,
  deletePasta,
} from "../services/pastaService";
import { useAuth } from "../contexts/AuthContext";
import type { Nota, Pasta } from "../types";
import "./NotesPage.css";

function stripMarkdown(text: string): string {
  return text
    .replace(/[#*_~`>\-\[\]()!]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHour < 24) return `${diffHour}h atrás`;
  if (diffDay < 7) return `${diffDay}d atrás`;
  return date.toLocaleDateString("pt-BR");
}

export default function NotesPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [notes, setNotes] = useState<Nota[]>([]);
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [selectedPastaId, setSelectedPastaId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  // Modal for creating pasta
  const [pastaModalOpen, setPastaModalOpen] = useState(false);
  const [newPastaName, setNewPastaName] = useState("");
  const [creatingPasta, setCreatingPasta] = useState(false);

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notesData, pastasData] = await Promise.all([
        getNotes(),
        getPastas(),
      ]);
      setNotes(notesData);
      setPastas(pastasData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao carregar dados";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Online/offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // PWA install prompt listener
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const installedHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promptEvent = installPrompt as any;
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  // Filter notes by selected pasta
  const pastaFilteredNotes = (() => {
    if (selectedPastaId === null) return notes;
    const pasta = pastas.find((p) => p.id_pasta === selectedPastaId);
    if (!pasta || pasta.id_notas === null) return [];
    return notes.filter((n) => n.id_nota === pasta.id_notas);
  })();

  // Filter by search
  const filteredNotes = pastaFilteredNotes.filter((n) =>
    n.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteNote = async (id_nota: number) => {
    try {
      await deleteNote(id_nota);
      setNotes((prev) => prev.filter((n) => n.id_nota !== id_nota));
      message.success("Nota excluída");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao excluir nota";
      message.error(errorMsg);
    }
  };

  const handleDeletePasta = async (id_pasta: number) => {
    try {
      await deletePasta(id_pasta);
      setPastas((prev) => prev.filter((p) => p.id_pasta !== id_pasta));
      if (selectedPastaId === id_pasta) setSelectedPastaId(null);
      message.success("Pasta excluída");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao excluir pasta";
      message.error(errorMsg);
    }
  };

  const handleCreatePasta = async () => {
    if (!newPastaName.trim()) return;
    setCreatingPasta(true);
    try {
      const newPasta = await createPasta(newPastaName.trim());
      setPastas((prev) => [newPasta, ...prev]);
      setPastaModalOpen(false);
      setNewPastaName("");
      message.success("Pasta criada");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao criar pasta";
      message.error(errorMsg);
    } finally {
      setCreatingPasta(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === "undefined") {
      message.warning("Notificações não suportadas neste navegador");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotifGranted(true);
      new Notification("Notes App", { body: "Notificações ativadas!" });
    } else {
      message.warning("Permissão negada");
    }
  };

  return (
    <div className="notes-layout">
      {/* ── Sidebar ── */}
      <aside className="notes-sidebar">
        <div className="sidebar-header">
          <h2>📁 Pastas</h2>
          <button
            className="toolbar-btn"
            onClick={() => setPastaModalOpen(true)}
            title="Nova pasta"
            style={{ fontSize: 18, padding: "4px 10px" }}
          >
            +
          </button>
        </div>

        <button
          className={`sidebar-item ${selectedPastaId === null ? "active" : ""}`}
          onClick={() => setSelectedPastaId(null)}
        >
          <span className="sidebar-item-label">📋 Todas as notas</span>
        </button>

        {pastas.map((pasta) => (
          <div
            key={pasta.id_pasta}
            className={`sidebar-item ${selectedPastaId === pasta.id_pasta ? "active" : ""}`}
            onClick={() => setSelectedPastaId(pasta.id_pasta)}
          >
            <span className="sidebar-item-label">📁 {pasta.nome}</span>
            <Popconfirm
              title="Excluir pasta?"
              description="A pasta será excluída permanentemente."
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDeletePasta(pasta.id_pasta);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Excluir"
              cancelText="Cancelar"
            >
              <button
                className="delete-btn"
                onClick={(e) => e.stopPropagation()}
                title="Excluir pasta"
              >
                ×
              </button>
            </Popconfirm>
          </div>
        ))}
      </aside>

      {/* ── Main ── */}
      <main className="notes-main">
        {!isOnline && (
          <Alert
            className="offline-alert"
            message="Você está offline. Mostrando dados em cache."
            type="warning"
            showIcon
            closable
          />
        )}

        <div className="notes-topbar">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {!notifGranted && (
            <button
              className="notification-btn"
              onClick={handleEnableNotifications}
            >
              🔔 Ativar notificações
            </button>
          )}
          {installPrompt && !isInstalled && (
            <button
              className="install-btn"
              onClick={handleInstallApp}
            >
              📲 Instalar App
            </button>
          )}
          <button
            className="new-note-btn"
            onClick={() => navigate("/notes/new")}
          >
            + Nova nota
          </button>
          <button
            className="logout-btn"
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
          >
            Sair
          </button>
        </div>

        {loading ? (
          <div className="notes-loading">
            <Spin size="large" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="notes-empty">
            <div className="empty-icon">📝</div>
            <p>
              {searchQuery
                ? "Nenhuma nota encontrada para esta busca."
                : selectedPastaId !== null
                  ? "Nenhuma nota nesta pasta."
                  : "Você ainda não tem notas."}
            </p>
            <p style={{ fontSize: 14, opacity: 0.6 }}>
              Clique em "+ Nova nota" para começar.
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <div
                key={note.id_nota}
                className="note-card"
                onClick={() => navigate(`/notes/${note.id_nota}`)}
              >
                <h3 className="note-card-title">
                  {note.titulo || "Sem título"}
                </h3>
                <p className="note-card-preview">
                  {stripMarkdown(note.texto).slice(0, 80) || "Sem conteúdo"}
                </p>
                <div className="note-card-footer">
                  <span className="note-card-date">
                    {formatDate(note.data_atualizacao)}
                  </span>
                  <Popconfirm
                    title="Excluir nota?"
                    description="Esta ação não pode ser desfeita."
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteNote(note.id_nota);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="Excluir"
                    cancelText="Cancelar"
                  >
                    <button
                      className="delete-note-btn"
                      onClick={(e) => e.stopPropagation()}
                      title="Excluir nota"
                    >
                      🗑️
                    </button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Create Pasta Modal ── */}
      <Modal
        title="Nova pasta"
        open={pastaModalOpen}
        onOk={handleCreatePasta}
        onCancel={() => {
          setPastaModalOpen(false);
          setNewPastaName("");
        }}
        confirmLoading={creatingPasta}
        okText="Criar"
        cancelText="Cancelar"
      >
        <Input
          placeholder="Nome da pasta"
          value={newPastaName}
          onChange={(e) => setNewPastaName(e.target.value)}
          onPressEnter={handleCreatePasta}
          autoFocus
        />
      </Modal>
    </div>
  );
}
