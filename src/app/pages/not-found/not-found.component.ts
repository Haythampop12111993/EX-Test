import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-ground p-4 overflow-hidden relative" dir="ltr">
      <!-- Background Blobs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div class="absolute top-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-40 right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center max-w-2xl mx-auto p-8 bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl animate-fade-in-down">
        
        <!-- Icon/Illustration -->
        <div class="mb-8 relative inline-block">
            <div class="absolute inset-0 bg-blue-200 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
            <i class="pi pi-exclamation-circle text-8xl text-blue-500 relative z-10"></i>
        </div>

        <!-- Text -->
        <h1 class="text-8xl font-black text-slate-800 mb-2 tracking-tighter">404</h1>
        <h2 class="text-2xl md:text-3xl font-bold text-slate-700 mb-4">
            {{ 'errors.notFoundPage.title' | translate }}
        </h2>
        <p class="text-slate-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            {{ 'errors.notFoundPage.desc' | translate }}
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button pButton 
                label="{{ 'errors.notFoundPage.backHome' | translate }}" 
                icon="pi pi-home" 
                class="p-button-lg p-button-rounded w-full sm:w-auto font-bold shadow-lg shadow-blue-500/20"
                routerLink="/">
            </button>
            <button pButton 
                label="{{ 'errors.notFoundPage.back' | translate }}" 
                icon="pi pi-arrow-left" 
                class="p-button-lg p-button-rounded p-button-outlined p-button-secondary w-full sm:w-auto font-bold"
                onclick="history.back()">
            </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
  `]
})
export class NotFoundComponent {}
