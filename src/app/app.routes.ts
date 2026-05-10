import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Dashboard - AgendaClayton',
  },
  {
    path: 'novo',
    loadComponent: () => import('./pages/show-form/show-form.component').then(m => m.ShowFormComponent),
    title: 'Novo Show - AgendaClayton',
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./pages/show-form/show-form.component').then(m => m.ShowFormComponent),
    title: 'Editar Show - AgendaClayton',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
