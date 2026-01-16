import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../../core/services/layout.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../../../shared/components/language-switcher/language-switcher.component';
import { LogoutButtonComponent } from '../../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    InputTextModule, 
    TranslateModule,
    LanguageSwitcherComponent,
    LogoutButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="h-20 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-40 transition-all duration-300">
      
      <!-- Left: Toggle & Search -->
      <div class="flex items-center gap-4">
        <p-button 
            (onClick)="layoutService.toggleSidebar()" 
            icon="pi pi-bars" 
            [text]="true" 
            [rounded]="true" 
            styleClass="w-10 h-10 text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
        </p-button>

        <div class="hidden md:flex items-center relative group">
            <i class="pi pi-search absolute left-3 text-slate-400 group-focus-within:text-brand-500 transition-colors z-10"></i>
            <input type="text" 
                [placeholder]="'search' | translate" 
                class="pl-10 pr-4 py-2 bg-surface-ground border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-100 focus:bg-white transition-all w-64 placeholder-slate-400 text-slate-700">
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">
        <app-language-switcher></app-language-switcher>
        
        <p-button 
            icon="pi pi-bell" 
            [text]="true" 
            [rounded]="true" 
            pBadge="2" 
            badgeClass="bg-red-500"
            styleClass="w-10 h-10 text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
        </p-button>

        <div class="w-px h-8 bg-surface-border mx-2"></div>

        <app-logout-button></app-logout-button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  layoutService = inject(LayoutService);
}
