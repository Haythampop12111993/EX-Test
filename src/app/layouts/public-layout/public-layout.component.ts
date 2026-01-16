import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { LogoutButtonComponent } from '../../shared/components/logout-button/logout-button.component';
import { HomeButtonComponent } from '../../shared/components/home-button/home-button.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LanguageSwitcherComponent, 
    LogoutButtonComponent, 
    HomeButtonComponent
  ],
  template: `
    <div class="relative min-h-screen flex flex-col font-sans">
        <header class="flex justify-between items-center p-6 z-50 bg-transparent">
            <app-language-switcher></app-language-switcher>
            <div class="flex-1 flex justify-center">
                <app-home-button></app-home-button>
            </div>
            <app-logout-button></app-logout-button>
        </header>

        <main class="flex-1 px-4 pb-12">
            <router-outlet></router-outlet>
        </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent {}
