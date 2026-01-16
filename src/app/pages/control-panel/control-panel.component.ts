import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../layouts/main-layout/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../layouts/main-layout/components/header/header.component';

@Component({
    selector: 'app-control-panel',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SidebarComponent,
        HeaderComponent
    ],
    template: `
        <div class="flex min-h-screen bg-surface-ground font-sans" dir="rtl">
            <!-- Sidebar -->
            <app-sidebar></app-sidebar>

            <!-- Main Content Wrapper -->
            <div class="flex-1 flex flex-col min-w-0 transition-all duration-300">
                
                <!-- Header -->
                <app-header></app-header>

                <!-- Page Content -->
                <main class="flex-1 p-6 overflow-x-hidden">
                    <div class="animate-fade-in">
                        <router-outlet></router-outlet>
                    </div>
                </main>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlPanelComponent {}
