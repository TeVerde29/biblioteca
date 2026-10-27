import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LibroService } from '../../services/libro.service';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.interface';

declare var bootstrap: any;

@Component({
  selector: 'app-libro-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './libro-modal.component.html',
  styleUrls: ['./libro-modal.component.css']
})
export class LibroModalComponent implements OnInit {
  @ViewChild('libroModal') modalElement!: ElementRef;
  @Output() libroGuardado = new EventEmitter<void>();

  libroForm: FormGroup;
  categorias: Categoria[] = [];
  isEditMode: boolean = false;
  libroId: number | null = null;
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';
  
  private modalInstance: any;

  constructor(
    private fb: FormBuilder,
    private libroService: LibroService,
    private categoriaService: CategoriaService
  ) {
    this.libroForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      autor: ['', [Validators.required, Validators.minLength(3)]],
      isbn: ['', [Validators.required]],
      editorial: ['', [Validators.required]],
      idcategoria: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.categorias = this.categoriaService.obtenerCategorias();
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement, {
      keyboard: false,
      backdrop: 'static'
    });
  }

  abrirModal(libroId?: number): void {
    this.error = '';
    this.successMessage = '';
    
    if (libroId) {
      this.isEditMode = true;
      this.libroId = libroId;
      this.cargarLibro(libroId);
    } else {
      this.isEditMode = false;
      this.libroId = null;
      this.libroForm.reset();
    }
    
    this.modalInstance.show();
  }

  cerrarModal(): void {
    this.modalInstance.hide();
    this.libroForm.reset();
    this.error = '';
    this.successMessage = '';
  }

  cargarLibro(id: number): void {
    this.loading = true;
    this.libroService.obtenerLibroPorId(id).subscribe({
      next: (response) => {
        if (response.success && !Array.isArray(response.data)) {
          this.libroForm.patchValue(response.data!);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el libro';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.libroForm.invalid) {
      this.libroForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const libroData = this.libroForm.value;

    if (this.isEditMode && this.libroId) {
      // Actualizar
      this.libroService.actualizarLibro(this.libroId, libroData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Libro actualizado exitosamente';
            setTimeout(() => {
              this.libroGuardado.emit();
              this.cerrarModal();
            }, 1000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al actualizar el libro';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      // Crear
      this.libroService.crearLibro(libroData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Libro creado exitosamente';
            setTimeout(() => {
              this.libroGuardado.emit();
              this.cerrarModal();
            }, 1000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al crear el libro';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  // Helpers para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.libroForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.libroForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
