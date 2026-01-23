import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FieldConfig } from '../../models/field-config.interface';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
    TextareaModule,
    DatePickerModule,
    InputNumberModule,
    FileUploadModule,
    ImageModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() config: FieldConfig[] = [];
  @Input() initialData: any = {};
  @Input() submitLabel: string = 'save';
  @Input() cancelLabel: string = 'cancel';
  @Input() loading: boolean = false;
  
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  
  // Store previews for file inputs
  filePreviews: { [key: string]: string | undefined } = {};

  ngOnInit() {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && !changes['initialData'].firstChange) {
      if (this.form) {
        this.form.patchValue(this.initialData);
        // Reset previews when initial data changes
        this.filePreviews = {};
      }
    }
    if (changes['config'] && !changes['config'].firstChange) {
        this.createForm();
    }
  }

  createForm() {
    const group: Record<string, FormControl> = {};
    this.filePreviews = {}; // Reset previews

    this.config.forEach(field => {
      const controlValidators = field.validations ? field.validations.map(v => v.validator) : [];
      if (field.required) {
          controlValidators.push(Validators.required);
      }
      
      const value = this.initialData && this.initialData[field.name] !== undefined 
        ? this.initialData[field.name] 
        : (field.value !== undefined ? field.value : '');

      group[field.name] = new FormControl(
        { value: value, disabled: field.disabled || false },
        controlValidators
      );
    });

    this.form = this.fb.group(group);
  }

  onFileSelect(event: any, fieldName: string) {
    // PrimeNG FileUpload onSelect event returns { originalEvent: Event, files: File[] }
    // For basic mode, it might be different depending on version, but usually similar.
    // If using custom upload handler, we get the files.
    
    const file = event.files[0]; // Assuming single file for now
    if (file) {
      this.form.patchValue({ [fieldName]: file });
      this.form.get(fieldName)?.markAsDirty();
      this.form.get(fieldName)?.markAsTouched();

      // Create preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.filePreviews[fieldName] = (e.target?.result as string) || undefined;
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
      } else {
        this.filePreviews[fieldName] = undefined;
        this.cdr.markForCheck();
      }
    }
  }

  hasRequiredValidation(field: FieldConfig): boolean {
    return field.validations?.some(v => v.name === 'required') ?? false;
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.getRawValue());
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }
}
