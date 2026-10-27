export interface Categoria {
  idcategoria: number;
  nombre: string;
}

export interface CategoriaResponse {
  success: boolean;
  categoria?: Categoria;
  data?: Libro[];
  count?: number;
  mensaje?: string;
  error?: string;
}

// Interface para Libro (necesaria aquí)
interface Libro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  editorial: string;
  idcategoria: number;
}
