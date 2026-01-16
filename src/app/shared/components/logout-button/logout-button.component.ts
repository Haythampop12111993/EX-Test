import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-logout-button',
    standalone: true,
    imports: [TranslateModule],
    template: `
    @if (isVisible()) {
      <button 
        (click)="logout()"
        class="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-full hover:shadow-md hover:bg-rose-50 border-rose-100 transition-all duration-300 cursor-pointer animate-fade-in"
        title="{{ 'login.logout' | translate }}">
        
        <div class="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
          <i class="pi pi-power-off text-sm"></i>
        </div>
        
        <span class="text-sm font-bold text-slate-600 group-hover:text-rose-700 hidden sm:block">
          {{ 'login.logout' | translate }}
        </span>
      </button>
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutButtonComponent {
    private router = inject(Router);

    // Auto-hide on login/auth pages
    isVisible = toSignal(
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map((e) => !e.urlAfterRedirects.includes('/auth')),
            startWith(!this.router.url.includes('/auth'))
        )
    );

    logout() {
        localStorage.removeItem('ACCESS_TOKEN');
        this.router.navigate(['/auth/login']);
    }
}
