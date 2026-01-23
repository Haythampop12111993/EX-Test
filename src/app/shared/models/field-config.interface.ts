import { ValidatorFn } from '@angular/forms';

export interface FieldConfig {
    type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'checkbox' | 'file';
    name: string;
    label: string;
    value?: any;
    placeholder?: string;
    options?: { label: string, value: any }[];
    validations?: {
        name: string;
        validator: ValidatorFn;
        message: string;
    }[];
    gridClass?: string;
    required?: boolean;
    disabled?: boolean;
    // File upload specific properties
    accept?: string;
    fileMode?: 'basic' | 'advanced'; // PrimeNG file upload mode
    showPreview?: boolean;
    maxFileSize?: number;
}
