import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.interface';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  tokenValido: boolean | null = null;
  loading = true;
  error = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser();
    this.authService.obtenerPerfil().subscribe({
      next: (res) => {
        if (res.success && res.data) this.usuario = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'No se pudo cargar el perfil';
        this.loading = false;
      }
    });
    this.authService.verificarToken().subscribe({
      next: () => (this.tokenValido = true),
      error: () => (this.tokenValido = false)
    });
  }

  logout(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) this.authService.logout();
  }
}
