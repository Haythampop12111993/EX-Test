import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pesticides',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './pesticides.component.html',
  styleUrl: './pesticides.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PesticidesComponent {}
