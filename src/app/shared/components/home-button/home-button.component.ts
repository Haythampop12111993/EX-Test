import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-home-button',
    standalone: true,
    imports: [TranslateModule],
    template: `
    @if (isVisible()) {
      <button 
        (click)="goHome()"
        class="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-full hover:shadow-md hover:bg-indigo-50 border-indigo-100 transition-all duration-300 cursor-pointer animate-fade-in"
        title="{{ 'common.home' | translate }}">
        
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
          <i class="pi pi-home text-sm"></i>
        </div>
        
        <span class="text-sm font-bold text-slate-600 group-hover:text-indigo-700 hidden sm:block">
          {{ 'common.home' | translate }}
        </span>
      </button>
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeButtonComponent {
    private router = inject(Router);

    // Auto-hide on login/auth pages
    isVisible = toSignal(
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map((e) => !e.urlAfterRedirects.includes('/auth')),
            startWith(!this.router.url.includes('/auth'))
        )
    );

    goHome() {
        this.router.navigate(['/dashboard']);
    }
}
