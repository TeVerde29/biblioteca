import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LibroService } from '../../services/libro.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { Libro } from '../../models/libro.interface';
import { Categoria } from '../../models/categoria.interface';
import { LibroModalComponent } from '../libro-modal/libro-modal.component';

@Component({
  selector: 'app-libro-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LibroModalComponent],
  templateUrl: './libro-list.component.html',
  styleUrls: ['./libro-list.component.css']
})
export class LibroListComponent implements OnInit {
  @ViewChild(LibroModalComponent) libroModal!: LibroModalComponent;
  
  libros: Libro[] = [];
  categorias: Categoria[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private libroService: LibroService,
    private categoriaService: CategoriaService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarLibros();
    this.categorias = this.categoriaService.obtenerCategorias();
  }

  cargarLibros(): void {
    this.loading = true;
    this.error = '';
    
    this.libroService.obtenerLibros().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.libros = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los libros';
        console.error(err);
        this.loading = false;
      }
    });
  }

  abrirModalNuevo(): void {
    this.libroModal.abrirModal();
  }

  abrirModalEditar(id: number): void {
    this.libroModal.abrirModal(id);
  }

  onLibroGuardado(): void {
    this.cargarLibros();
  }

  eliminarLibro(id: number): void {
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      this.error = 'Solo un administrador puede eliminar libros';
      return;
    }
    if (confirm('¿Estás seguro de eliminar este libro?')) {
      this.libroService.eliminarLibro(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarLibros();
          }
        },
        error: (err) => {
          this.error = err.status === 403
            ? 'No tienes permisos (se requiere rol admin)'
            : 'Error al eliminar el libro';
          console.error(err);
        }
      });
    }
  }

  obtenerNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(c => c.idcategoria === idCategoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  }
}
