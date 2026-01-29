import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard-hub/dashboard-hub.component').then(m => m.DashboardHubComponent),
      },
      {
        path: 'operations/scouting',
        loadComponent: () => import('./pages/operations/add-scouting/add-scouting.component').then(m => m.AddScoutingComponent),
      },
      {
        path: 'operations/control',
        loadComponent: () => import('./pages/operations/add-control/add-control.component').then(m => m.AddControlComponent),
      },
      {
        path: 'monitoring',
        loadComponent: () => import('./pages/monitoring/add-monitoring/add-monitoring.component').then(m => m.AddMonitoringComponent),
      },
      {
        path: 'monitoring/scouting',
        loadComponent: () => import('./pages/monitoring/monitor-scouting/monitor-scouting.component').then(m => m.MonitorScoutingComponent),
      },
      {
        path: 'monitoring/control',
        loadComponent: () => import('./pages/monitoring/monitor-control/monitor-control.component').then(m => m.MonitorControlComponent),
      },
    ]
  },
  {
    path: 'control-panel',
    loadChildren: () => import('./pages/control-panel/control-panel.routes').then(m => m.CONTROL_PANEL_ROUTES),
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
  },
  { path: '**', redirectTo: 'not-found' },
];
