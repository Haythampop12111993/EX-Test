import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../../../../core/services/layout.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, PanelMenuModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="fixed top-0 bottom-0 z-50 flex flex-col w-72 bg-white border-r border-surface-border shadow-xl transition-all duration-300 ease-in-out lg:static lg:h-screen lg:shadow-none"
      [class.hidden-sidebar]="!layoutService.sidebarVisible()"
      [class.translate-x-full]="!layoutService.sidebarVisible() && isMobile"
      [class.lg:w-0]="!layoutService.sidebarVisible()"
      [class.lg:opacity-0]="!layoutService.sidebarVisible()"
      [class.lg:overflow-hidden]="!layoutService.sidebarVisible()"
    >
      <!-- Logo Area -->
      <div class="flex items-center justify-center h-20 border-b border-surface-border shrink-0 bg-surface-ground/50 backdrop-blur-sm">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <i class="pi pi-shield text-white text-xl"></i>
            </div>
            <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-brand-500">
                Admin<span class="text-slate-800">Pro</span>
            </span>
        </div>
      </div>

      <!-- Menu Container -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div class="mb-4 px-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ 'dashboard.controlPanel.menu' | translate }}</span>
        </div>
        <p-panelMenu [model]="items" styleClass="w-full border-none"></p-panelMenu>
      </div>

      <!-- User Profile Footer -->
      <div class="p-4 border-t border-surface-border bg-surface-ground/30">
        <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-soft transition-all cursor-pointer group">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" 
                 class="w-10 h-10 rounded-full bg-white border border-surface-border shadow-sm group-hover:scale-105 transition-transform">
            <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-800 truncate">Admin User</p>
                <p class="text-xs text-slate-500 truncate group-hover:text-brand-600 transition-colors">admin@company.com</p>
            </div>
            <i class="pi pi-cog text-slate-400 group-hover:text-brand-500 transition-colors"></i>
        </div>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div *ngIf="layoutService.sidebarVisible() && isMobile" 
         (click)="layoutService.toggleSidebar()"
         class="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm lg:hidden animate-fade-in">
    </div>
  `,
  styles: [`
    :host {
        display: contents;
    }
    .hidden-sidebar {
        /* Handled via classes */
    }
    ::ng-deep .p-panelmenu .p-panelmenu-header-content {
        @apply border-none bg-transparent mb-1 rounded-xl transition-all duration-200 !important;
    }
    ::ng-deep .p-panelmenu .p-panelmenu-header-action {
        @apply font-semibold text-slate-600 py-3 px-4 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-all !important;
    }
    ::ng-deep .p-panelmenu .p-panelmenu-content {
        @apply border-none bg-transparent py-1 !important;
    }
    ::ng-deep .p-panelmenu .p-menuitem-link {
        @apply py-2.5 px-8 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50/50 transition-all !important;
    }
    ::ng-deep .p-panelmenu .p-menuitem-text {
        @apply font-medium !important;
    }
  `]
})
export class SidebarComponent implements OnInit {
  layoutService = inject(LayoutService);
  private translate = inject(TranslateService);
  
  items: MenuItem[] = [];
  isMobile = window.innerWidth < 1024;

  constructor() {
    window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth < 1024;
        if (!this.isMobile) {
            this.layoutService.setSidebarState(true);
        } else {
            this.layoutService.setSidebarState(false);
        }
    });
  }

  ngOnInit() {
    this.updateMenu();
    this.translate.onLangChange.subscribe(() => this.updateMenu());
  }

  updateMenu() {
    this.translate.get('dashboard.controlPanel').subscribe(cp => {
        if (!cp || typeof cp !== 'object') return;

        this.items = [
            {
                label: cp.dashboard?.title || 'Dashboard',
                icon: 'pi pi-home',
                routerLink: ['dashboard'],
                styleClass: 'mb-1'
            },
            {
                label: cp.operations || 'Operations',
                icon: 'pi pi-server',
                expanded: true,
                items: [
                    {
                        label: cp.scoutingOps?.title || 'Scouting Operations',
                        icon: 'pi pi-search',
                        routerLink: ['scouting-ops']
                    },
                    {
                        label: cp.controlOps?.title || 'Control Operations',
                        icon: 'pi pi-shield',
                        routerLink: ['control-ops']
                    }
                ]
            },
            {
                label: cp.evaluation || 'Evaluation',
                icon: 'pi pi-chart-bar',
                expanded: true,
                items: [
                    {
                        label: cp.scoutingEval?.title || 'Scouting Evaluation',
                        icon: 'pi pi-check-circle',
                        routerLink: ['scouting-eval']
                    },
                    {
                        label: cp.controlEval?.title || 'Control Evaluation',
                        icon: 'pi pi-file-edit',
                        routerLink: ['control-eval']
                    }
                ]
            },
            {
                label: cp.administration || 'Administration',
                icon: 'pi pi-cog',
                expanded: true,
                items: [
                    {
                        label: cp.users?.title || 'Users',
                        icon: 'pi pi-users',
                        routerLink: ['users']
                    },
                    {
                        label: cp.pesticides?.title || 'Pesticides',
                        icon: 'pi pi-box',
                        routerLink: ['pesticides']
                    },
                    {
                        label: cp.pests?.title || 'Pests',
                        icon: 'pi pi-exclamation-triangle',
                        routerLink: ['pests']
                    }
                ]
            }
        ];
    });
  }
}
