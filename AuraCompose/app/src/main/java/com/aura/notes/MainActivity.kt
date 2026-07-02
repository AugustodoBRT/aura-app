package com.aura.notes

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.aura.notes.data.Nota
import com.aura.notes.data.notasMock
import com.aura.notes.ui.screens.EditorScreen
import com.aura.notes.ui.screens.LoginScreen
import com.aura.notes.ui.screens.NotesScreen
import com.aura.notes.ui.screens.RegisterScreen
import com.aura.notes.ui.screens.SettingsScreen
import com.aura.notes.ui.screens.UsuariosScreen
import com.aura.notes.ui.screens.GalleryScreen
import com.aura.notes.ui.theme.AuraTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AuraApp()
        }
    }
}

private enum class Screen { LOGIN, REGISTER, MAIN, EDITOR, USUARIOS, GALLERY }
private enum class Tab { NOTES, SETTINGS }

@Composable
fun AuraApp() {
    // Estado global mockado (remember + mutableStateOf) — sem backend/auth
    var isDark by remember { mutableStateOf(false) }
    var screen by remember { mutableStateOf(Screen.LOGIN) }
    var tab by remember { mutableStateOf(Tab.NOTES) }
    var editing by remember { mutableStateOf<Nota?>(null) }
    val notas = remember { mutableStateListOf<Nota>().apply { addAll(notasMock) } }
    val emailMock = "aluno@cefetmg.br"

    AuraTheme(darkTheme = isDark) {
        Surface(modifier = Modifier.fillMaxSize()) {
            when (screen) {
                Screen.LOGIN -> LoginScreen(
                    onLogin = { screen = Screen.MAIN },
                    onGoRegister = { screen = Screen.REGISTER }
                )

                Screen.REGISTER -> RegisterScreen(
                    onRegister = { screen = Screen.MAIN },
                    onBack = { screen = Screen.LOGIN }
                )

                Screen.MAIN -> MainScaffold(
                    tab = tab,
                    onTabChange = { tab = it },
                    notas = notas,
                    email = emailMock,
                    isDark = isDark,
                    onToggleDark = { isDark = it },
                    onOpenNote = { editing = it; screen = Screen.EDITOR },
                    onNewNote = { editing = null; screen = Screen.EDITOR },
                    onOpenUsuarios = { screen = Screen.USUARIOS },
                    onOpenGallery = { screen = Screen.GALLERY },
                    onLogout = { screen = Screen.LOGIN; tab = Tab.NOTES }
                )

                Screen.EDITOR -> EditorScreen(
                    nota = editing,
                    onSave = { titulo, texto ->
                        val atual = editing
                        if (atual == null) {
                            val novoId = (notas.maxOfOrNull { it.id } ?: 0) + 1
                            notas.add(0, Nota(novoId, titulo, texto, "agora"))
                        } else {
                            val idx = notas.indexOfFirst { it.id == atual.id }
                            if (idx >= 0) {
                                notas[idx] = atual.copy(titulo = titulo, texto = texto, dataAtualizacao = "agora")
                            }
                        }
                        screen = Screen.MAIN
                    },
                    onBack = { screen = Screen.MAIN }
                )

                Screen.USUARIOS -> UsuariosScreen(
                    onBack = { screen = Screen.MAIN }
                )

                Screen.GALLERY -> GalleryScreen(
                    onBack = { screen = Screen.MAIN }
                )
            }
        }
    }
}

@Composable
private fun MainScaffold(
    tab: Tab,
    onTabChange: (Tab) -> Unit,
    notas: List<Nota>,
    email: String,
    isDark: Boolean,
    onToggleDark: (Boolean) -> Unit,
    onOpenNote: (Nota) -> Unit,
    onNewNote: () -> Unit,
    onOpenUsuarios: () -> Unit,
    onOpenGallery: () -> Unit,
    onLogout: () -> Unit
) {
    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = tab == Tab.NOTES,
                    onClick = { onTabChange(Tab.NOTES) },
                    icon = { Icon(Icons.AutoMirrored.Filled.List, contentDescription = "Notas") },
                    label = { Text("Notas") }
                )
                NavigationBarItem(
                    selected = tab == Tab.SETTINGS,
                    onClick = { onTabChange(Tab.SETTINGS) },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Ajustes") },
                    label = { Text("Ajustes") }
                )
            }
        }
    ) { innerPadding ->
        when (tab) {
            Tab.NOTES -> androidx.compose.foundation.layout.Box(modifier = Modifier.padding(innerPadding)) {
                NotesScreen(notas = notas, onOpenNote = onOpenNote, onNewNote = onNewNote)
            }
            Tab.SETTINGS -> androidx.compose.foundation.layout.Box(modifier = Modifier.padding(innerPadding)) {
                SettingsScreen(
                    email = email,
                    isDark = isDark,
                    onToggleDark = onToggleDark,
                    onOpenUsuarios = onOpenUsuarios,
                    onOpenGallery = onOpenGallery,
                    onLogout = onLogout
                )
            }
        }
    }
}
