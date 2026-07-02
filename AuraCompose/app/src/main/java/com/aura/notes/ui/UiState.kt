package com.aura.notes.ui

// Estado de UI para chamadas assíncronas.
// Equivale ao padrão { data, loading, error } do useFetch no React Native.
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val mensagem: String) : UiState<Nothing>()
}
