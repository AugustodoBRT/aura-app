export interface Nota {
  id_nota: number;
  id_user: number;
  titulo: string;
  texto: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Pasta {
  id_pasta: number;
  created_at: string;
  edited_at: string | null;
  id_usuario: number;
  id_notas: number | null;
  nome: string;
}
