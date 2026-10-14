import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'pacientes', loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent) },
      { path: 'medicos', loadComponent: () => import('./features/medicos/medicos.component').then(m => m.MedicosComponent) },
      { path: 'citas', loadComponent: () => import('./features/citas/citas.component').then(m => m.CitasComponent) },
      { path: 'consultas', loadComponent: () => import('./features/consultas/consultas.component').then(m => m.ConsultasComponent) },
      { path: 'formulas-magistrales', loadComponent: () => import('./features/formulas-magistrales/formulas-magistrales.component').then(m => m.FormulasMagistralesComponent) },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/roles.component').then(m => m.RolesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
    ]
  },
  { path: '**', component: NotFoundComponent }
];
