import { supabase } from "../lib/supabase";
import type { Pasta } from "../types";

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

export async function getPastas(): Promise<Pasta[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("pasta")
    .select("*")
    .eq("id_usuario", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPastaById(id_pasta: number): Promise<Pasta> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("pasta")
    .select("*")
    .eq("id_pasta", id_pasta)
    .eq("id_usuario", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createPasta(
  nome: string,
  id_notas?: number
): Promise<Pasta> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("pasta")
    .insert({
      id_usuario: userId,
      nome,
      id_notas: id_notas ?? null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updatePasta(
  id_pasta: number,
  nome: string,
  id_notas?: number
): Promise<Pasta> {
  const userId = await getCurrentUserId();

  const updateData: Record<string, unknown> = {
    nome,
    edited_at: new Date().toISOString(),
  };
  if (id_notas !== undefined) {
    updateData.id_notas = id_notas;
  }

  const { data, error } = await supabase
    .from("pasta")
    .update(updateData)
    .eq("id_pasta", id_pasta)
    .eq("id_usuario", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePasta(id_pasta: number): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("pasta")
    .delete()
    .eq("id_pasta", id_pasta)
    .eq("id_usuario", userId);

  if (error) throw new Error(error.message);
}
