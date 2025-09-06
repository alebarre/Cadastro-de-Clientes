import { Routes } from '@angular/router';
import { ClientesListComponent } from './pages/clientes-list/clientes-list.component';
import { ClienteFormComponent } from './pages/cliente-form/cliente-form.component';
import { ClienteCardComponent } from './pages/clientes-card/cliente-card.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clientes' },
  { path: 'clientes', component: ClientesListComponent },
  { path: 'clientes/novo', component: ClienteFormComponent },
  { path: 'clientes/:id', component: ClienteFormComponent },
  { path: 'clientes/:id/card', component: ClienteCardComponent },
  { path: '**', redirectTo: 'clientes' },
];
