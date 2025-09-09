import { Routes } from '@angular/router';
import { ClientesListComponent } from './pages/clientes-list/clientes-list.component';
import { ClienteFormComponent } from './pages/cliente-form/cliente-form.component';
import { authGuard } from './guards/auth.guard';
import { ClienteCardComponent } from './pages/clientes-card/cliente-card.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotComponent } from './pages/forgot/forgot.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', redirectTo: 'clientes' },

  {
    path: 'clientes',
    component: ClientesListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'clientes/novo',
    component: ClienteFormComponent,
    canActivate: [authGuard],
  }, // <— deixar livre p/ USER
  {
    path: 'clientes/:id',
    component: ClienteFormComponent,
    canActivate: [authGuard, adminGuard],
  }, // <— editar ADMIN
  {
    path: 'clientes/:id/card',
    component: ClienteCardComponent,
    canActivate: [authGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot', component: ForgotComponent },

  { path: '**', redirectTo: 'clientes' },
];
