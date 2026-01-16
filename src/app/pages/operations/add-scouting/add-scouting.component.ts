import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-add-scouting',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './add-scouting.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddScoutingComponent { }
