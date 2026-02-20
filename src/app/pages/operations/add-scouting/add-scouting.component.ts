import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { ScoutingReportsService } from '../../../core/services/scouting-reports.service';
import { PestsService } from '../../../core/services/pests.service';
import { PestLookupItem } from '../../../core/models/pest.model';
import { InfestationSeverity, ScoutingPriority, ScoutingReportCreateDto, ScoutingSource } from '../../../core/models/scouting.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-add-scouting',
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
    DialogModule,
    FileUploadModule,
    TextareaModule
  ],
  templateUrl: './add-scouting.component.html',
  styleUrl: './add-scouting.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddScoutingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private scoutingService = inject(ScoutingReportsService);
  private pestsService = inject(PestsService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  form: FormGroup;
  pestOptions = signal<PestLookupItem[]>([]);
  pestsLoading = signal(false);
  pestsLoadError = signal<string | null>(null);
  submitting = signal(false);
  locationLoading = signal(false);
  uploadedFiles = signal<{ file: File; url: string }[]>([]);

  severityOptions = signal<{ label: string; value: string }[]>([]);
  priorityOptions = signal<{ label: string; value: ScoutingPriority }[]>([]);
  sourceOptions = signal<{ label: string; value: ScoutingSource }[]>([]);
  infestationLevelOptions = signal<{ label: string; value: InfestationSeverity }[]>([]);
  createdVisible = signal(false);
  createdCode = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      Latitude: [null],
      Longitude: [null],
      AddressDetails: ['', Validators.required],
      Notes: ['', Validators.required],
      Source: ['Manual' as ScoutingSource, Validators.required],
      Priority: ['Low' as ScoutingPriority, Validators.required],
      PriorityReason: ['', Validators.required],
      InfestationLevel: ['Low' as InfestationSeverity, Validators.required],
      Pests: this.fb.array([])
    });

    this.destroyRef.onDestroy(() => {
      this.uploadedFiles().forEach((x) => URL.revokeObjectURL(x.url));
    });
  }

  ngOnInit() {
    this.loadPests();
    this.buildSelectOptions();
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.buildSelectOptions());
  }

  get pestsArray(): FormArray {
    return this.form.get('Pests') as FormArray;
  }

  loadPests() {
    this.pestsLoading.set(true);
    this.pestsLoadError.set(null);
    this.pestsService
      .getPestsLookup()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(finalize(() => this.pestsLoading.set(false)))
      .subscribe({
        next: (pests) => {
          this.pestOptions.set(pests);
        },
        error: () => {
          this.pestsLoadError.set(this.translate.instant('common.loadFailed'));
          this.pestOptions.set([]);
        }
      });
  }

  addPest() {
    const pestGroup = this.fb.group({
      pestId: [null, Validators.required],
      severity: ['Low', Validators.required],
      affectedAreaPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      localNotes: ['']
    });
    this.pestsArray.push(pestGroup);
  }

  removePest(index: number) {
    this.pestsArray.removeAt(index);
  }

  getCurrentLocation() {
    this.locationLoading.set(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.form.patchValue({
            Latitude: position.coords.latitude,
            Longitude: position.coords.longitude
          });
          this.locationLoading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('dashboard.addScouting.location.updated')
          });
        },
        () => {
          this.locationLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('dashboard.addScouting.location.failed')
          });
        }
      );
    } else {
      this.locationLoading.set(false);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('dashboard.addScouting.location.unsupported')
      });
    }
  }

  onUpload(event: unknown) {
    const files = this.getFilesFromUploadEvent(event);
    if (files.length === 0) return;

    const next = [...this.uploadedFiles()];
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      next.push({ file, url: URL.createObjectURL(file) });
    });
    this.uploadedFiles.set(next);

    this.messageService.add({
      severity: 'info',
      summary: this.translate.instant('common.success'),
      detail: this.translate.instant('dashboard.addScouting.images.added')
    });
  }

  removeFile(index: number) {
    const items = [...this.uploadedFiles()];
    const removed = items.splice(index, 1)[0];
    if (removed?.url) URL.revokeObjectURL(removed.url);
    this.uploadedFiles.set(items);
  }

  private getFilesFromUploadEvent(event: unknown): File[] {
    if (!event || typeof event !== 'object') return [];
    const maybeFiles = (event as { files?: unknown }).files;
    if (!Array.isArray(maybeFiles)) return [];
    return maybeFiles.filter((f): f is File => f instanceof File);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formValue = this.form.value;

    const payload: ScoutingReportCreateDto = {
      ...formValue,
      Images: this.uploadedFiles().map((x) => x.file)
    };

    this.scoutingService.createScoutingReport(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (created) => {
          this.createdCode.set(created?.code ?? null);
          this.createdVisible.set(true);
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

  closeCreated(): void {
    this.createdVisible.set(false);
    this.router.navigate(['/control-panel/scouting-ops']);
  }

  private buildSelectOptions(): void {
    this.severityOptions.set([
      { label: this.translate.instant('common.severity.low'), value: 'Low' },
      { label: this.translate.instant('common.severity.medium'), value: 'Medium' },
      { label: this.translate.instant('common.severity.high'), value: 'High' },
      { label: this.translate.instant('common.severity.severe'), value: 'Severe' }
    ]);

    this.infestationLevelOptions.set([
      { label: this.translate.instant('common.severity.low'), value: 'Low' },
      { label: this.translate.instant('common.severity.medium'), value: 'Medium' },
      { label: this.translate.instant('common.severity.high'), value: 'High' },
      { label: this.translate.instant('common.severity.severe'), value: 'Severe' }
    ]);

    this.priorityOptions.set([
      { label: this.translate.instant('common.priority.low'), value: 'Low' },
      { label: this.translate.instant('common.priority.medium'), value: 'Medium' },
      { label: this.translate.instant('common.priority.high'), value: 'High' },
      { label: this.translate.instant('common.priority.critical'), value: 'Critical' }
    ]);

    this.sourceOptions.set([
      { label: this.translate.instant('common.source.manual'), value: 'Manual' },
      { label: this.translate.instant('common.source.system'), value: 'System' },
      { label: this.translate.instant('common.source.imported'), value: 'Imported' }
    ]);
  }
}
