import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Libro, LibroResponse } from '../models/libro.interface';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private apiUrl = `${environment.apiUrl}/libros`;

  constructor(private http: HttpClient) { }

  // Obtener todos los libros
  obtenerLibros(): Observable<LibroResponse> {
    return this.http.get<LibroResponse>(this.apiUrl);
  }

  // Obtener libro por ID
  obtenerLibroPorId(id: number): Observable<LibroResponse> {
    return this.http.get<LibroResponse>(`${this.apiUrl}/${id}`);
  }

  // Crear libro
  crearLibro(libro: Libro): Observable<LibroResponse> {
    return this.http.post<LibroResponse>(this.apiUrl, libro);
  }

  // Actualizar libro
  actualizarLibro(id: number, libro: Libro): Observable<LibroResponse> {
    return this.http.put<LibroResponse>(`${this.apiUrl}/${id}`, libro);
  }

  // Eliminar libro
  eliminarLibro(id: number): Observable<LibroResponse> {
    return this.http.delete<LibroResponse>(`${this.apiUrl}/${id}`);
  }

  // Obtener libros por categoría
  obtenerLibrosPorCategoria(idCategoria: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/librosByCategoria/${idCategoria}`);
  }
}
