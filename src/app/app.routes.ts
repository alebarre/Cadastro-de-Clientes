import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotComponent } from './pages/forgot/forgot.component';
import { ClientesReportComponent } from './pages/clientes-report/clientes-report.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot', component: ForgotComponent },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot', loadComponent: () => import('./pages/forgot/forgot.component').then(m => m.ForgotComponent) },

  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      // paths:
      { path: 'clientes', loadComponent: () => import('./pages/clientes-list/clientes-list.component').then(m => m.ClientesListComponent) },
      { path: 'clientes/novo', loadComponent: () => import('./pages/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent) },
      { path: 'clientes/:id/card', loadComponent: () => import('./pages/clientes-card/cliente-card.component').then(m => m.ClienteCardComponent) },
      { path: 'clientes/:id', loadComponent: () => import('./pages/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent) },
      { path: 'relatorios', loadComponent: () => import('./pages/clientes-report/clientes-report.component').then(m => m.ClientesReportComponent) },

      { path: 'usuarios', canActivate: [adminGuard], loadComponent: () => import('./pages/usuario-list/usuarios-list.component').then(m => m.UsuariosListComponent) },
      { path: 'usuarios/novo', canActivate: [adminGuard], loadComponent: () => import('./pages/usuario-form/usuarios-form.component').then(m => m.UsuariosFormComponent) },
      { path: 'usuarios/:id', canActivate: [adminGuard], loadComponent: () => import('./pages/usuario-form/usuarios-form.component').then(m => m.UsuariosFormComponent) },
      { path: 'cobrancas', canActivate: [adminGuard], loadComponent: () => import('./pages/cobrancas/cobrancas.component').then(m => m.CobrancasComponent) },

      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot', component: ForgotComponent },

      { path: '', pathMatch: 'full', redirectTo: 'clientes' },
    ],
  },

  { path: '', pathMatch: 'full', redirectTo: 'app' },
  { path: '**', redirectTo: 'app' },
];
