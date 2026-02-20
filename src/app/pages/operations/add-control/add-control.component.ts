import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { ScoutingReportsService } from '../../../core/services/scouting-reports.service';
import { ReadyStockItem } from '../../../core/models/inventory.model';
import { ScoutingDetailsDto } from '../../../core/models/scouting.model';
import { EntityId } from '../../../core/models/common.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-add-control',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    DatePickerModule,
    CheckboxModule
  ],
  templateUrl: './add-control.component.html',
  styleUrl: './add-control.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddControlComponent implements OnInit {
  private fb = inject(FormBuilder);
  private scoutingService = inject(ScoutingReportsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  form: FormGroup;
  scoutingId: EntityId | null = null;
  loading = signal(false);
  submitting = signal(false);
  loadError = signal<string | null>(null);

  scoutingReport = signal<ScoutingDetailsDto | null>(null);
  readyStocks = signal<ReadyStockItem[]>([]);

  constructor() {
    this.form = this.fb.group({
      readyStockId: [null, Validators.required],
      litersUsed: [null, [Validators.required, Validators.min(0.1)]],
      applicationMethod: [''],
      nextFollowUpDate: [null],
      evaluationDate: [null],
      needsAnotherControl: [false],
      notes: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const rawId = params['scoutingId'];
      const parsedId = typeof rawId === 'string' && rawId.trim() !== '' ? Number(rawId) : NaN;
      this.scoutingId = Number.isFinite(parsedId) ? parsedId : null;
      if (this.scoutingId) {
        this.loadData(this.scoutingId);
      }
    });
  }

  loadData(id: EntityId) {
    this.loading.set(true);
    this.loadError.set(null);

    this.scoutingService
      .getScoutingReportById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => {
          this.scoutingReport.set(report);
          this.loadStocks(id);
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set(this.translate.instant('common.loadFailed'));
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('common.loadFailed')
          });
        }
      });
  }

  loadStocks(id: EntityId) {
    this.scoutingService
      .getReadyStocks(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (stocks) => {
          this.readyStocks.set(stocks);
        },
        error: () => {
          this.loadError.set(this.translate.instant('common.loadFailed'));
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('common.loadFailed')
          });
        }
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.scoutingId == null) return;

    this.submitting.set(true);
    const formValue = this.form.value;

    // Format dates
    const payload = {
      readyStockId: formValue.readyStockId as EntityId,
      litersUsed: formValue.litersUsed as number,
      notes: (formValue.notes as string) || undefined,
      needsAnotherControl: (formValue.needsAnotherControl as boolean) || false,
      applicationMethod: (formValue.applicationMethod as string) || undefined,
      nextFollowUpDate: formValue.nextFollowUpDate ? new Date(formValue.nextFollowUpDate).toISOString() : undefined,
      evaluationDate: formValue.evaluationDate ? new Date(formValue.evaluationDate).toISOString() : undefined
    };

    this.scoutingService.createControlOperation(this.scoutingId, payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('common.savedSuccessfully')
          });
          this.router.navigate(['/control-panel/control-ops']);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('common.saveFailed')
          });
        }
      });
  }
}
