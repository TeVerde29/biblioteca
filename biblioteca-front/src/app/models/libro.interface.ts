export interface Libro {
  id?: number;
  titulo: string;
  autor: string;
  isbn: string;
  editorial: string;
  idcategoria: number;
}

export interface LibroResponse {
  success: boolean;
  data?: Libro | Libro[];
  count?: number;
  mensaje?: string;
  error?: string;
}