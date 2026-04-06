import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Select, message } from "antd";
import { marked } from "marked";
import {
  getNoteById,
  createNote,
  updateNote,
} from "../services/notesService";
import { getPastas, updatePasta } from "../services/pastaService";
import type { Pasta } from "../types";
import "./NoteEditorPage.css";

type EditorMode = "edit" | "preview";

export default function NoteEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";

  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [mode, setMode] = useState<EditorMode>("edit");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [selectedPastaId, setSelectedPastaId] = useState<number | undefined>(
    undefined
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load note data if editing
  const loadNote = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const note = await getNoteById(Number(id));
      setTitulo(note.titulo);
      setTexto(note.texto);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao carregar nota";
      message.error(errorMsg);
      navigate("/notes");
    } finally {
      setLoading(false);
    }
  }, [id, isNew, navigate]);

  // Load pastas
  const loadPastas = useCallback(async () => {
    try {
      const data = await getPastas();
      setPastas(data);
      // If editing, find if this note belongs to a pasta
      if (!isNew && id) {
        const linked = data.find((p) => p.id_notas === Number(id));
        if (linked) setSelectedPastaId(linked.id_pasta);
      }
    } catch {
      // Silently fail — pastas are optional
    }
  }, [id, isNew]);

  useEffect(() => {
    loadNote();
    loadPastas();
  }, [loadNote, loadPastas]);

  const handleSave = async () => {
    if (!titulo.trim()) {
      message.warning("Informe um título para a nota");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const created = await createNote(titulo.trim(), texto);
        // Link to pasta if selected
        if (selectedPastaId) {
          await updatePasta(
            selectedPastaId,
            pastas.find((p) => p.id_pasta === selectedPastaId)?.nome ?? "",
            created.id_nota
          );
        }
        message.success("Nota criada");
        navigate(`/notes/${created.id_nota}`, { replace: true });
      } else {
        await updateNote(Number(id), titulo.trim(), texto);
        // Update pasta linkage
        if (selectedPastaId) {
          const pasta = pastas.find((p) => p.id_pasta === selectedPastaId);
          if (pasta) {
            await updatePasta(selectedPastaId, pasta.nome, Number(id));
          }
        }
        message.success("Nota salva");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao salvar nota";
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      message.error("Geolocalização não suportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        setTexto((prev) => prev + `\n📍 Lat: ${lat}, Lon: ${lon}\n`);
      },
      () => {
        message.error("Não foi possível obter localização");
      }
    );
  };

  // Camera / image picker
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setTexto((prev) => prev + `\n![imagem](${base64})\n`);
    };
    reader.onerror = () => {
      message.error("Erro ao carregar imagem");
    };
    reader.readAsDataURL(file);

    // Reset file input so the same file can be selected again
    e.target.value = "";
  };

  // Render markdown
  const renderMarkdown = (md: string): string => {
    return marked.parse(md, { async: false }) as string;
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* ── Header ── */}
      <header className="editor-header">
        <button className="editor-back-btn" onClick={() => navigate("/notes")}>
          ← Notas
        </button>
        <h1 className="editor-title">
          {isNew ? "Nova nota" : titulo || "Sem título"}
        </h1>
        <div className="editor-actions">
          <Select
            placeholder="Pasta (opcional)"
            allowClear
            style={{ minWidth: 160 }}
            value={selectedPastaId}
            onChange={(val) => setSelectedPastaId(val)}
            options={pastas.map((p) => ({
              value: p.id_pasta,
              label: `📁 ${p.nome}`,
            }))}
          />
          <button
            className="editor-toggle-btn"
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
          >
            {mode === "edit" ? "Visualizar" : "Editar"}
          </button>
          <button
            className="editor-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      {/* ── Toolbar (edit mode only) ── */}
      {mode === "edit" && (
        <div className="editor-toolbar">
          <button className="toolbar-btn" onClick={handleGeolocation}>
            📍 Localização
          </button>
          <button className="toolbar-btn" onClick={handleImageClick}>
            📷 Imagem
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>
      )}

      {/* ── Body ── */}
      <div className="editor-body">
        {mode === "edit" ? (
          <>
            <input
              className="editor-titulo-input"
              type="text"
              placeholder="Título da nota"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <textarea
              ref={textareaRef}
              className="editor-textarea"
              placeholder="Escreva em Markdown..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </>
        ) : (
          <div className="editor-preview">
            <h1 className="preview-title">{titulo || "Sem título"}</h1>
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(texto || "*Nenhum conteúdo ainda.*"),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
