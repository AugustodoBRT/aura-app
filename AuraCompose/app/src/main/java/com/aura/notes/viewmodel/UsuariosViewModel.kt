package com.aura.notes.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aura.notes.model.Usuario
import com.aura.notes.network.RetrofitClient
import com.aura.notes.ui.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// ViewModel + StateFlow = equivalente ao hook useFetch do React Native.
class UsuariosViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<UiState<List<Usuario>>>(UiState.Loading)
    val uiState: StateFlow<UiState<List<Usuario>>> = _uiState.asStateFlow()

    init {
        buscarUsuarios()
    }

    fun buscarUsuarios() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val usuarios = RetrofitClient.api.listarUsuarios()
                _uiState.value = UiState.Success(usuarios)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Erro desconhecido ao carregar")
            }
        }
    }
}
