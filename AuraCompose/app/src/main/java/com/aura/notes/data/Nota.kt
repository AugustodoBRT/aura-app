package com.aura.notes.data

// Modelo mockado (sem backend). Espelha a Nota do app React Native.
data class Nota(
    val id: Int,
    val titulo: String,
    val texto: String,
    val dataAtualizacao: String
)

// Dados estáticos (mock) - atende ao "LazyColumn com 5 itens" do PDF
val notasMock: List<Nota> = listOf(
    Nota(
        id = 1,
        titulo = "Bem-vindo ao Aura",
        texto = "# Olá!\nEste é seu app de notas em **Markdown**. Toque para editar.",
        dataAtualizacao = "22/06/2026"
    ),
    Nota(
        id = 2,
        titulo = "Lista de compras",
        texto = "- Café\n- Leite\n- Pão\n- Ovos",
        dataAtualizacao = "21/06/2026"
    ),
    Nota(
        id = 3,
        titulo = "Ideias do projeto",
        texto = "Reproduzir as telas do app React Native em Jetpack Compose usando Material 3.",
        dataAtualizacao = "20/06/2026"
    ),
    Nota(
        id = 4,
        titulo = "Reunião de quinta",
        texto = "Pauta:\n1. Revisão da entrega 3.1\n2. Próximos passos\n3. Dúvidas",
        dataAtualizacao = "19/06/2026"
    ),
    Nota(
        id = 5,
        titulo = "Estudar Compose",
        texto = "Column, Row, Box, Modifier, Scaffold, LazyColumn, remember + mutableStateOf.",
        dataAtualizacao = "18/06/2026"
    )
)
