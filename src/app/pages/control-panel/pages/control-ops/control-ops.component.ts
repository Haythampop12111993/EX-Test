import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-control-ops',
  standalone: true,
  imports: [CommonModule, TranslateModule, TableModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">{{ 'dashboard.controlPanel.controlOps.title' | translate }}</h2>
      
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <p-table [value]="ops() || []" [tableStyle]="{ 'min-width': '50rem' }" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
                <tr>
                    <th class="text-xs uppercase text-slate-500 bg-slate-50 p-4">{{ 'dashboard.table.headers.id' | translate }}</th>
                    <th class="text-xs uppercase text-slate-500 bg-slate-50 p-4">{{ 'dashboard.table.headers.site' | translate }}</th>
                    <th class="text-xs uppercase text-slate-500 bg-slate-50 p-4">{{ 'dashboard.table.headers.date' | translate }}</th>
                    <th class="text-xs uppercase text-slate-500 bg-slate-50 p-4">{{ 'dashboard.table.headers.technician' | translate }}</th>
                    <th class="text-xs uppercase text-slate-500 bg-slate-50 p-4">{{ 'dashboard.table.headers.status' | translate }}</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-op>
                <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                    <td class="p-4 font-mono text-xs text-slate-600">{{ op.id }}</td>
                    <td class="p-4 font-bold text-slate-700">{{ op.siteName }}</td>
                    <td class="p-4 text-sm text-slate-600">{{ op.date }}</td>
                    <td class="p-4 text-sm text-slate-600">{{ op.technician }}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-full text-xs font-bold"
                              [ngClass]="{
                                'bg-emerald-100 text-emerald-700': op.status === 'Completed',
                                'bg-amber-100 text-amber-700': op.status === 'Pending',
                                'bg-blue-100 text-blue-700': op.status === 'In Progress'
                              }">
                            {{ op.status }}
                        </span>
                    </td>
                </tr>
            </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlOpsComponent {
  private mockService = inject(MockDataService);
  ops = toSignal(this.mockService.getControlOps());
}
