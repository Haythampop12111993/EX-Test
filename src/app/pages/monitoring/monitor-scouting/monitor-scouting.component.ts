import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-monitor-scouting',
    standalone: true,
    imports: [TranslateModule, CommonModule],
    templateUrl: './monitor-scouting.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorScoutingComponent { }
