import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, CategoriaResponse } from '../models/categoria.interface';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  // Obtener libros por categoría
  obtenerLibrosPorCategoria(id: number): Observable<CategoriaResponse> {
    return this.http.get<CategoriaResponse>(`${this.apiUrl}/${id}`);
  }

  // Método auxiliar para obtener lista de categorías (si tienes endpoint en backend)
  // Por ahora retornamos lista hardcodeada basada en tu BD
  obtenerCategorias(): Categoria[] {
    return [
      { idcategoria: 1, nombre: 'Drama' },
      { idcategoria: 2, nombre: 'Comedia' },
      { idcategoria: 3, nombre: 'Biografía' }
    ];
  }
}
