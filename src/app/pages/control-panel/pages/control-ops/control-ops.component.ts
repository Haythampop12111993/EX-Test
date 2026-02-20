import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { ScoutingReportsService } from '../../../../core/services/scouting-reports.service';
import { PagedResult } from '../../../../core/models/common.model';
import { ReportStatus, ScoutingSummaryDto } from '../../../../core/models/scouting.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-control-ops',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TooltipModule
  ],
  templateUrl: './control-ops.component.html',
  styleUrl: './control-ops.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlOpsComponent {
  private scoutingService = inject(ScoutingReportsService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  loadError = signal<string | null>(null);
  ops = signal<PagedResult<ScoutingSummaryDto> | null>(null);

  search = '';
  status: ReportStatus | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  statusOptions = signal<{ label: string; value: ReportStatus }[]>([]);

  constructor() {
    this.buildStatusOptions();
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.buildStatusOptions());
  }

  private lastLazyEvent = signal<{ first: number; rows: number } | null>(null);

  loadData(event: unknown): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    const e = event as Partial<Record<string, unknown>>;

    const first = typeof e['first'] === 'number' ? e['first'] : 0;
    const rows = typeof e['rows'] === 'number' ? e['rows'] : 10;
    this.lastLazyEvent.set({ first, rows });

    const pageIndex = Math.floor(first / rows) + 1;
    const searchValue = this.search.trim();
    const startDateValue = this.startDate ? this.startDate.toISOString() : undefined;
    const endDateValue = this.endDate ? this.endDate.toISOString() : undefined;

    this.scoutingService
      .getScoutingReports({
        PageSize: rows,
        PageIndex: pageIndex,
        Search: searchValue || undefined,
        Status: this.status || undefined,
        StartDate: startDateValue,
        EndDate: endDateValue
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.ops.set(res);
        },
        error: () => {
          this.loadError.set(this.translate.instant('common.loadFailed'));
          this.ops.set(null);
        },
      });
  }

  reload(): void {
    const ev = this.lastLazyEvent();
    this.loadData({ first: ev?.first ?? 0, rows: ev?.rows ?? 10 });
  }

  resetFilters(): void {
    this.search = '';
    this.status = null;
    this.startDate = null;
    this.endDate = null;
    this.reload();
  }

  statusLabel(status: ReportStatus): string {
    if (status === 'Pending') return this.translate.instant('dashboard.table.status.pending');
    if (status === 'In_Progress') return this.translate.instant('dashboard.table.status.inProgress');
    if (status === 'Completed') return this.translate.instant('dashboard.table.status.completed');
    if (status === 'Cancelled') return this.translate.instant('dashboard.table.status.cancelled');
    return status;
  }

  hasActiveFilters(): boolean {
    return this.search.trim() !== '' || this.status != null || this.startDate != null || this.endDate != null;
  }

  private buildStatusOptions(): void {
    this.statusOptions.set([
      { label: this.translate.instant('dashboard.table.status.pending'), value: 'Pending' as ReportStatus },
      { label: this.translate.instant('dashboard.table.status.inProgress'), value: 'In_Progress' as ReportStatus },
      { label: this.translate.instant('dashboard.table.status.completed'), value: 'Completed' as ReportStatus },
      { label: this.translate.instant('dashboard.table.status.cancelled'), value: 'Cancelled' as ReportStatus },
    ]);
  }
}
