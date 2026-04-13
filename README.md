# 📝 Aura — Notes App

Aplicativo de notas com suporte a Markdown, organização por pastas e funcionalidades PWA.

## ✨ Funcionalidades

- **Autenticação** — Cadastro e login com Supabase Auth
- **Notas em Markdown** — Editor com preview em tempo real
- **Pastas** — Organize suas notas em pastas personalizadas
- **Busca** — Filtre notas por título instantaneamente
- **Geolocalização** — Insira coordenadas GPS nas notas
- **Câmera/Imagem** — Capture ou selecione imagens direto no editor
- **Notificações Push** — Receba alertas no navegador
- **PWA** — Instale como app nativo, funciona offline
- **Responsivo** — Adaptado para desktop e mobile

## 🛠️ Tecnologias

- **React 19** + TypeScript
- **Vite 8** (build + dev server)
- **Supabase** (Auth + PostgreSQL)
- **Ant Design** (componentes UI)
- **Marked** (renderização Markdown)
- **vite-plugin-pwa** (Service Worker + manifest)

## 🚀 Como rodar

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

## 📁 Estrutura

```
src/
├── components/     # LoginForm, RegisterForm
├── contexts/       # AuthContext (Supabase Auth)
├── lib/            # Cliente Supabase
├── pages/          # NotesPage, NoteEditorPage
├── services/       # notesService, pastaService
└── types/          # Tipos TypeScript (Nota, Pasta)
```

## 🌐 Deploy

Deploy automático via **Vercel** conectado ao repositório GitHub.

## 📄 Licença

Este projeto é de uso acadêmico.
