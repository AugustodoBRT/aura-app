package com.aura.notes.model

// Modelo que mapeia o JSON de https://jsonplaceholder.typicode.com/users
// Equivale a uma interface/type do TypeScript no React Native.
data class Usuario(
    val id: Int,
    val name: String,
    val email: String,
    val phone: String = ""
)
