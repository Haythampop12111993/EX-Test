import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-add-control',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './add-control.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddControlComponent { }
