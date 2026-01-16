import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-hub',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './dashboard-hub.component.html',
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHubComponent {
  public router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
