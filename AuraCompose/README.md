# Aura — Jetpack Compose (Entrega 3.2)

App Android nativo em **Kotlin + Jetpack Compose + Material 3**, evolução da Entrega 3.1.
Agora com **chamada real de API** (Retrofit) e **acesso a recurso nativo** (galeria de imagens).
Continua **sem backend próprio** e com **navegação simples por estado** (sem Navigation Compose).

## Telas

- **Login**, **Cadastro**, **Notas** (lista + editor), **Ajustes** — da Entrega 3.1.
- **Usuários (API)** — nova: consome uma API pública e mostra Loading / Success / Error.
- **Galeria (recurso nativo)** — nova: abre a galeria do dispositivo e exibe a foto escolhida.

Acesso às duas telas novas: aba **Ajustes** -> botões "Usuários (API)" e "Galeria (recurso nativo)".

## 1. Chamada de API

- **API usada:** JSONPlaceholder (`https://jsonplaceholder.typicode.com/`).
- **Endpoint:** `GET /users` — retorna uma lista de usuários (id, name, email, phone).
- **Camadas:** `model/Usuario.kt` (data class), `network/ApiService.kt` (interface Retrofit),
  `network/RetrofitClient.kt` (cliente), `viewmodel/UsuariosViewModel.kt` (StateFlow),
  `ui/UiState.kt` (Loading/Success/Error), `ui/screens/UsuariosScreen.kt` (UI + `collectAsState`).
- **Como testar:** abrir o app -> Login (qualquer credencial) -> aba **Ajustes** -> **Usuários (API)**.
  A tela carrega os usuários; o ícone de atualizar (canto superior) refaz a chamada. Sem internet,
  aparece o estado de erro com botão **Tentar novamente**.

## 2. Recurso nativo

- **Recurso:** galeria de imagens (seletor de mídia do sistema).
- **Como acessa:** `ActivityResultContracts.PickVisualMedia()` via `rememberLauncherForActivityResult`,
  exibindo a imagem com a biblioteca **Coil** (`AsyncImage`). Arquivo: `ui/screens/GalleryScreen.kt`.
- **Permissão:** nenhuma permissão em runtime é necessária — o Android Photo Picker roda em processo
  isolado e devolve apenas a imagem escolhida.
- **Como testar:** app -> Login -> aba **Ajustes** -> **Galeria (recurso nativo)** -> tocar na área /
  "Abrir galeria" -> escolher uma foto -> ela aparece na tela.

## Arquitetura

```
com.aura.notes/
├── MainActivity.kt          entrada + estado global + navegacao por estado (enum Screen/Tab)
├── data/Nota.kt             modelo + 5 notas mockadas (LazyColumn)
├── model/Usuario.kt         modelo da API
├── network/ApiService.kt    endpoints Retrofit (GET /users)
├── network/RetrofitClient.kt cliente HTTP (Retrofit + OkHttp)
├── viewmodel/UsuariosViewModel.kt  StateFlow<UiState<List<Usuario>>>
├── ui/UiState.kt            sealed class Loading/Success/Error
└── ui/
    ├── theme/{Color,Theme}.kt  Material 3 claro/escuro
    └── screens/  Login, Register, Notes, Editor, Settings, Usuarios, Gallery
```

Padrao: **UI declarativa (Compose)** + **estado reativo (`mutableStateOf`/`StateFlow`)** +
**ViewModel** para a chamada assincrona. A navegacao e uma maquina de estados (`when(screen)`).

## Comparacao com React Native

| React Native (Entrega RN) | Android nativo (aqui) |
|---|---|
| `fetch` / camada de servico | Retrofit + Coroutines |
| hook `useFetch` (`{data,loading,error}`) | ViewModel + `StateFlow<UiState>` + `collectAsState()` |
| `useState` | `remember { mutableStateOf(...) }` |
| `FlatList` | `LazyColumn` |
| `expo-image-picker` | `ActivityResultContracts.PickVisualMedia()` |
| `<Image source={{uri}}>` | `AsyncImage(model = uri)` (Coil) |
| `StyleSheet` | `Modifier` encadeado |

## Como gerar o APK (Debug)

1. Abrir a pasta do projeto no Android Studio e aguardar o Gradle Sync.
2. Menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Ao concluir, clicar em **locate** — o arquivo fica em
   `app/build/outputs/apk/debug/app-debug.apk`.
4. Para publicar: subir o repositorio ao GitHub, criar uma **Release** e anexar o `.apk`.

> Alternativa por terminal: `./gradlew assembleDebug` (Linux/macOS) ou `gradlew.bat assembleDebug` (Windows).

## Como demonstrar ao professor

1. Rodar no emulador/aparelho e fazer login.
2. Aba **Ajustes -> Usuários (API)**: mostrar o **Loading**, depois a **lista** vinda da API;
   tocar em **atualizar**; (opcional) desligar a internet e mostrar o **erro + Tentar novamente**.
3. Voltar e **Ajustes -> Galeria**: escolher uma foto e mostra-la na tela (recurso nativo).
4. Mostrar no codigo: `RetrofitClient` (endpoint), `UsuariosViewModel` (StateFlow) e
   `GalleryScreen` (PickVisualMedia + Coil).
