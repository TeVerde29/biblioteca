import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegistroComponent } from './auth/registro/registro.component';
import { PerfilComponent } from './auth/perfil/perfil.component';
import { LibroListComponent } from './components/libro-list/libro-list.component';
import { LibroFormComponent } from './components/libro-form/libro-form.component';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/libros', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'libros', component: LibroListComponent },
  {
    path: 'libros/nuevo',
    component: LibroFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'libros/editar/:id',
    component: LibroFormComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/libros' }
];