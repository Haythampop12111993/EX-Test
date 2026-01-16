import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-monitoring',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './add-monitoring.component.html',
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMonitoringComponent {
  private router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
