import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  template: `
    <div class="min-h-screen w-full overflow-hidden bg-surface-ground">
      <ng-content></ng-content>
    </div>
  `
})
export class AuthLayoutComponent {}
