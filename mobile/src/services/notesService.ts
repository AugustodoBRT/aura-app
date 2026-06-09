import { supabase } from "../lib/supabase";
import type { Nota } from "../types";

async function getCurrentUserId(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("usuario")
    .select("id_usuario")
    .eq("email", user.email)
    .single();

  if (error || !data) throw new Error("Usuário não encontrado na tabela usuario");
  return data.id_usuario;
}

export async function getNotes(): Promise<Nota[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("notas")
    .select("*")
    .eq("id_user", userId)
    .order("data_atualizacao", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getNoteById(id_nota: number): Promise<Nota> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("notas")
    .select("*")
    .eq("id_nota", id_nota)
    .eq("id_user", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createNote(titulo: string, texto: string): Promise<Nota> {
  const userId = await getCurrentUserId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("notas")
    .insert({
      id_user: userId,
      titulo,
      texto,
      data_criacao: now,
      data_atualizacao: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateNote(
  id_nota: number,
  titulo: string,
  texto: string
): Promise<Nota> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("notas")
    .update({
      titulo,
      texto,
      data_atualizacao: new Date().toISOString(),
    })
    .eq("id_nota", id_nota)
    .eq("id_user", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteNote(id_nota: number): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("notas")
    .delete()
    .eq("id_nota", id_nota)
    .eq("id_user", userId);

  if (error) throw new Error(error.message);
}
