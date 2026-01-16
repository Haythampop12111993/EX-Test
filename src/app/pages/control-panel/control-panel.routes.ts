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
                path: 'scouting-eval',
                loadComponent: () => import('./pages/scouting-eval/scouting-eval.component').then(m => m.ScoutingEvalComponent)
            },
            {
                path: 'control-eval',
                loadComponent: () => import('./pages/control-eval/control-eval.component').then(m => m.ControlEvalComponent)
            }
        ]
    }
];
