import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-scouting-eval',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">{{ 'dashboard.controlPanel.scoutingEval.title' | translate }}</h2>
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div class="p-8 text-center text-slate-400">
          {{ 'dashboard.controlPanel.scoutingEval.placeholder' | translate }}
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoutingEvalComponent { }
