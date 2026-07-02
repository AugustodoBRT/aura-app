package com.aura.notes.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aura.notes.data.Nota
import com.aura.notes.ui.theme.AuraTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(
    nota: Nota?,
    onSave: (titulo: String, texto: String) -> Unit,
    onBack: () -> Unit
) {
    val isNew = nota == null
    var titulo by remember { mutableStateOf(nota?.titulo ?: "") }
    var texto by remember { mutableStateOf(nota?.texto ?: "") }
    var preview by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isNew) "Nova nota" else "Editar nota") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    TextButton(onClick = { onSave(titulo, texto) }) {
                        Text("Salvar", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            OutlinedTextField(
                value = titulo,
                onValueChange = { titulo = it },
                placeholder = { Text("Título") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            // Toolbar (mock: insere texto local; sem câmera/GPS reais)
            Row(modifier = Modifier.padding(vertical = 8.dp)) {
                IconButton(onClick = { texto += "\n\n![imagem](mock)\n" }) {
                    Icon(Icons.Default.Image, contentDescription = "Inserir imagem", tint = MaterialTheme.colorScheme.primary)
                }
                IconButton(onClick = { texto += "\n\nLocal: -19.46, -42.53\n" }) {
                    Icon(Icons.Default.LocationOn, contentDescription = "Inserir local", tint = MaterialTheme.colorScheme.primary)
                }
                IconButton(onClick = { preview = !preview }) {
                    Icon(
                        if (preview) Icons.Default.Edit else Icons.Default.Visibility,
                        contentDescription = "Alternar preview",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }

            if (preview) {
                Card(modifier = Modifier.fillMaxSize()) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(16.dp)
                    ) {
                        Text(
                            text = texto.ifBlank { "_Sem conteúdo_" },
                            fontSize = 16.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            } else {
                OutlinedTextField(
                    value = texto,
                    onValueChange = { texto = it },
                    placeholder = { Text("Escreva em Markdown...") },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun EditorScreenPreview() {
    AuraTheme {
        EditorScreen(
            nota = Nota(1, "Exemplo", "# Título\nConteúdo em **markdown**.", "22/06/2026"),
            onSave = { _, _ -> },
            onBack = {}
        )
    }
}
