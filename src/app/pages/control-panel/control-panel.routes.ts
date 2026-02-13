import { Routes } from '@angular/router';
import { ControlPanelComponent } from './control-panel.component';

export const CONTROL_PANEL_ROUTES: Routes = [
    {
        path: '',
        component: ControlPanelComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/cp-dashboard/cp-dashboard.component').then(m => m.CpDashboardComponent)
            },
            {
                path: 'scouting-ops',
                loadComponent: () => import('./pages/scouting-ops/scouting-ops.component').then(m => m.ScoutingOpsComponent)
            },
            {
                path: 'control-ops',
                loadComponent: () => import('./pages/control-ops/control-ops.component').then(m => m.ControlOpsComponent)
            },
            {
                path: 'pests',
                loadComponent: () => import('./pages/pests/pests.component').then(m => m.PestsComponent)
            },
            {
                path: 'pesticides',
                loadComponent: () => import('./pages/pesticides/pesticides.component').then(m => m.PesticidesComponent)
            },
            {
                path: 'roles',
                loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
            },
            { path: '**', redirectTo: '/not-found' }
        ]
    }
];
