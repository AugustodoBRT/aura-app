package com.aura.notes.network

import com.aura.notes.model.Usuario
import retrofit2.http.GET

// Interface de endpoints (Retrofit). Equivale ao services/usuarios.ts do React Native.
interface ApiService {
    // GET https://jsonplaceholder.typicode.com/users
    @GET("users")
    suspend fun listarUsuarios(): List<Usuario>
}
