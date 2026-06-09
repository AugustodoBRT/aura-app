# Aura Mobile — React Native + Expo (SDK 52)

Port do PWA **Aura** (notas em Markdown) para Android nativo com **Expo Router**,
preservando **Supabase**, autenticacao e o CRUD de notas. Projeto pronto para:
abrir no VS Code, `npm install`, `npx expo start`, testar no celular e gerar APK via EAS.

## Mapeamento dos recursos nativos (compromisso herdado do PWA)

| Recurso no PWA (API do navegador)       | Equivalente Expo implementado        |
| --------------------------------------- | ------------------------------------ |
| Camera / selecao de imagem (input file) | expo-image-picker  (app/editor.tsx)  |
| Geolocalizacao (navigator.geolocation)  | expo-location      (app/editor.tsx)  |

Fluxo de permissao (conceder / negar / abrir Configuracoes): `src/lib/permissions.ts`

## Onde cada item da checklist esta atendido

| # | Requisito | Arquivo(s) |
|---|-----------|-----------|
| 1 | Expo Router (Stack + Tabs) | app/_layout.tsx, app/(tabs)/_layout.tsx |
| 2 | Telas principais | app/login.tsx, register.tsx, (tabs)/index.tsx, editor.tsx |
| 3 | fetch + hooks customizados + Context | src/hooks/useFetch.ts, useMutation.ts, src/contexts/* |
| 4 | 2 recursos nativos (SDK Expo) | app/editor.tsx (image-picker + location) |
| 5 | AsyncStorage + SecureStore | src/lib/supabase.ts, src/services/secureStore.ts, src/contexts/ThemeContext.tsx |
| 6 | Dark mode (useColorScheme + cores) | src/contexts/ThemeContext.tsx, src/theme/colors.ts |
| 7 | StyleSheet.create + FlatList | app/(tabs)/index.tsx e todas as telas |
| 8 | Erros de rede / permissoes / loading | hooks + try/catch + Alert em todas as telas |
| 11 | Fluxos de permissao | src/lib/permissions.ts |
| 12-13 | eas.json + build APK | eas.json (perfil production -> buildType apk) |

## Como rodar (desenvolvimento)

```
npm install
npx expo start
```

Abra o **Expo Go** no Android e escaneie o QR Code (REQUISITO 9 e 10: teste em
dispositivo fisico). Teste tambem **negar** as permissoes de foto/localizacao para
ver o alerta de "Abrir Configuracoes" (REQUISITO 11).

> SecureStore nao funciona no navegador (web), mas funciona no Expo Go Android.

## Build de producao (APK) e Release

```
npm install -g eas-cli
eas login
eas build:configure          # preenche o projectId em app.json
eas build -p android --profile production
```

Baixe o `.apk` pelo link do EAS. Depois:

```
git tag v1.0.0
git push origin v1.0.0
```

No GitHub: Releases > Draft a new release > escolha a tag v1.0.0 > faca upload do `.apk` > Publish.

## Supabase

Credenciais (URL + anon/publishable key) ja estao em `src/lib/supabase.ts`,
reaproveitadas do PWA. Tabelas usadas: `usuario`, `notas`, `pasta` (inalteradas).
