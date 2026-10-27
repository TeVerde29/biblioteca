import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.registro(this.registroForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.success = 'Usuario registrado. Redirigiendo al login...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.error = res.mensaje || 'No se pudo registrar';
        }
        this.loading = false;
      },
      error: (err) => {
        const e = err.error;
        this.error = e?.mensaje || e?.errores?.[0]?.msg || 'Error al registrar usuario';
        this.loading = false;
      }
    });
  }

  isFieldInvalid(f: string): boolean {
    const c = this.registroForm.get(f);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
