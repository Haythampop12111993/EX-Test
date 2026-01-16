import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-monitor-control',
    standalone: true,
    imports: [TranslateModule, CommonModule],
    templateUrl: './monitor-control.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorControlComponent { }
