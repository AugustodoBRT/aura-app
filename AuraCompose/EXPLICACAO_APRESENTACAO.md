# Explicação para Apresentação — Entrega 3.2 (Aura / Jetpack Compose)

Baseado exclusivamente no código deste projeto. Sem backend próprio; navegação por estado.

---

## PARTE A — Explicação do código

### Retrofit (chamada de API)
- `network/ApiService.kt`: interface com `@GET("users") suspend fun listarUsuarios(): List<Usuario>`.
  A anotação define o endpoint; `suspend` permite rodar sem travar a thread principal (como `async`).
- `network/RetrofitClient.kt`: monta o cliente com `baseUrl` = JSONPlaceholder, `GsonConverterFactory`
  (JSON -> data class) e um `OkHttpClient` com `HttpLoggingInterceptor`. É um `object` (singleton) `by lazy`.
- `model/Usuario.kt`: data class que o Gson preenche a partir do JSON.

### ViewModel
- `viewmodel/UsuariosViewModel.kt`: guarda o estado da tela e faz a chamada em `buscarUsuarios()`
  dentro de `viewModelScope.launch { ... }` (coroutine ligada ao ciclo de vida do ViewModel).
  `init { buscarUsuarios() }` carrega ao criar. Em erro, captura a exceção e emite `UiState.Error`.

### StateFlow
- No ViewModel, `_uiState` é `MutableStateFlow<UiState<List<Usuario>>>` (privado, escrita) e `uiState`
  é `asStateFlow()` (público, leitura). É o equivalente ao `{data,loading,error}` do `useFetch`, mas
  tipado por uma `sealed class` (`ui/UiState.kt`: Loading / Success / Error).

### Compose (a tela)
- `ui/screens/UsuariosScreen.kt`: `val uiState by viewModel.uiState.collectAsState()` observa o StateFlow
  e recompõe quando muda. O `when (estado)` trata os 3 casos: `CircularProgressIndicator` (Loading),
  mensagem + botão (Error), `LazyColumn` de `Card`s (Success). O ícone de refresh chama `buscarUsuarios()`.

### Recurso nativo (galeria)
- `ui/screens/GalleryScreen.kt`: `rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia())`
  cria o launcher; `launcher.launch(PickVisualMediaRequest(...ImageOnly))` abre o seletor do sistema.
  O `Uri` retornado é guardado em `remember { mutableStateOf<Uri?>(null) }` e exibido com `AsyncImage`
  (Coil). Não exige permissão em runtime (Photo Picker do Android).

---

## PARTE B — Perguntas que o professor pode fazer (com respostas)

1. **O que é o Retrofit?** Biblioteca de cliente HTTP que transforma uma interface anotada em chamadas
   REST; equivale ao fetch/serviço do RN. (`ApiService.kt`, `RetrofitClient.kt`)
2. **O que faz `suspend`?** Marca uma função que pode pausar/retomar sem bloquear a thread; só roda
   dentro de coroutine. (`ApiService.kt`)
3. **O que é uma coroutine e o `viewModelScope`?** Unidade de execução assíncrona; `viewModelScope`
   cancela a coroutine automaticamente quando o ViewModel é destruído. (`UsuariosViewModel.kt`)
4. **Por que ViewModel e não estado na tela?** Sobrevive à recomposição e à rotação, e separa lógica
   de UI. (`UsuariosViewModel.kt`)
5. **O que é StateFlow?** Fluxo observável que mantém o último valor e notifica observadores; como um
   `useState` compartilhável. (`UsuariosViewModel.kt`)
6. **Diferença entre MutableStateFlow e StateFlow?** O mutável permite escrita (privado); o `asStateFlow()`
   expõe só leitura para a UI. (`UsuariosViewModel.kt`)
7. **O que é `collectAsState()`?** Ponte que observa o StateFlow no Compose e dispara recomposição ao mudar.
   (`UsuariosScreen.kt`)
8. **Como você trata loading/erro/sucesso?** Com uma `sealed class UiState` e um `when` exaustivo.
   (`UiState.kt`, `UsuariosScreen.kt`)
9. **Por que `sealed class`?** O compilador garante que todos os casos sejam tratados no `when`.
   (`UiState.kt`)
10. **Qual endpoint você chama?** `GET https://jsonplaceholder.typicode.com/users`. (`ApiService.kt`)
11. **Como o JSON vira objeto?** `GsonConverterFactory` desserializa para `Usuario`. (`RetrofitClient.kt`)
12. **Precisa de permissão para internet?** Sim, `INTERNET` no Manifest (permissão normal, sem diálogo).
    (`AndroidManifest.xml`)
13. **Como funciona o botão atualizar?** Chama `viewModel.buscarUsuarios()`, que volta a Loading e refaz
    a chamada. (`UsuariosScreen.kt`)
14. **O que acontece sem internet?** A exceção é capturada e vira `UiState.Error` com "Tentar novamente".
    (`UsuariosViewModel.kt`)
15. **Qual o recurso nativo e por que esse?** Galeria via `PickVisualMedia` — o mais simples de demonstrar
    e sem pedir permissão. (`GalleryScreen.kt`)
16. **Como exibe a imagem?** `AsyncImage` da biblioteca Coil, a partir do `Uri`. (`GalleryScreen.kt`)
17. **Por que não precisa de permissão na galeria?** O Photo Picker roda isolado e retorna só a foto
    escolhida. (`GalleryScreen.kt`)
18. **O que é `rememberLauncherForActivityResult`?** Registra um contrato de resultado de Activity e
    devolve um launcher; equivale ao `requestPermissionsAsync`/picker do Expo. (`GalleryScreen.kt`)
19. **Como navega entre as telas?** Máquina de estados: enum `Screen` + `when(screen)` na `AuraApp`.
    (`MainActivity.kt`)
20. **Por que não usou Navigation Compose?** Escopo pequeno; estado puro é mais simples de explicar.
    Limitação: sem back stack do sistema. (`MainActivity.kt`)
21. **Onde estão as telas obrigatórias em Compose?** Login, Register, Notes, Editor, Settings + as novas
    Usuarios e Gallery. (`ui/screens/`)
22. **O que é recomposição?** Reexecução das funções `@Composable` que leem um estado alterado.
23. **Como o dark mode funciona?** Um booleano de estado escolhe `light/darkColorScheme` no `AuraTheme`.
    (`Theme.kt`, `MainActivity.kt`)
24. **Diferença Compose x React Native?** Mesmo paradigma declarativo; Kotlin vs TS. Tabela no README.
25. **O estado sobrevive à rotação?** O do ViewModel sim; o de `remember` nas telas, não (usaria
    `rememberSaveable`). (limitação assumida)

---

## PARTE C — Alterações rápidas ao vivo

| Alteração | Arquivo | Passo | Tempo |
|---|---|---|---|
| Trocar endpoint (users -> posts) | `network/ApiService.kt` | mudar `@GET("users")` para `@GET("posts")` e ajustar o modelo/campos exibidos | ~2 min |
| Trocar a API (baseUrl) | `network/RetrofitClient.kt` | alterar `BASE_URL` | ~30 s |
| Mostrar telefone na lista | `ui/screens/UsuariosScreen.kt` | adicionar `Text(usuario.phone)` no Card | ~40 s |
| Mudar cor primária | `ui/theme/Color.kt` | trocar `LightPrimary` | ~30 s |
| Adicionar nota mockada | `data/Nota.kt` | copiar um bloco `Nota(...)` | ~40 s |
| Mudar título da tela de API | `ui/screens/UsuariosScreen.kt` | editar `Text("Usuários (API)")` | ~15 s |
| Mudar ícone do FAB (Notas) | `ui/screens/NotesScreen.kt` | trocar `Icons.Default.Add` | ~40 s |
| Trocar texto do botão da galeria | `ui/screens/GalleryScreen.kt` | editar `Text("Abrir galeria")` | ~15 s |
| Iniciar no modo escuro | `MainActivity.kt` | `mutableStateOf(true)` em `isDark` | ~15 s |
| Adicionar aba nova | `MainActivity.kt` | enum `Tab` + `NavigationBarItem` + `when(tab)` | ~3 min |

---

## PARTE D — Roteiro de apresentação (5 minutos)

1. **(0:00-0:40)** Abrir o app; login com credencial qualquer (mock). Dizer: *"Frontend Compose da 3.1;
   agora adicionei chamada de API e recurso nativo."*
2. **(0:40-2:00)** Ajustes -> **Usuários (API)**. Mostrar o **Loading**, depois a **lista** da API.
   Dizer: *"Retrofit faz o GET /users; o ViewModel expõe um StateFlow com Loading/Success/Error, e a tela
   observa com collectAsState."* Tocar em **atualizar**.
3. **(2:00-2:40)** (Opcional) desligar internet, tocar atualizar, mostrar **erro + Tentar novamente**.
   Dizer: *"O erro é tratado pela sealed class UiState."*
4. **(2:40-3:40)** Voltar -> **Galeria (recurso nativo)**. Escolher uma foto; ela aparece.
   Dizer: *"Recurso nativo via PickVisualMedia; exibo com Coil; não precisa de permissão."*
5. **(3:40-4:30)** Abrir no editor: `RetrofitClient` (endpoint), `UsuariosViewModel` (StateFlow),
   `GalleryScreen` (launcher). Citar as equivalências com o RN (fetch->Retrofit, useFetch->ViewModel).
6. **(4:30-5:00)** Fechar: *"Duas telas Compose (na verdade 7), uma chamada de API real e um recurso
   nativo, tudo documentado no README, com APK Debug gerável pelo Build > Build APK(s)."*

Pontos fracos a assumir se perguntado: sem back stack do sistema (navegação por estado); estado de
`remember` não sobrevive à rotação (o do ViewModel sim); a tela de API não pagina resultados.
