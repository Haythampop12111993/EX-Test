import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector, private zone: NgZone) {}

  handleError(error: any): void {
    const messageService = this.injector.get(MessageService);
    const translate = this.injector.get(TranslateService);

    // Always log the error to the console
    console.error('GlobalErrorHandler caught an error:', error);

    // Use NgZone to run the toast display inside the Angular zone
    this.zone.run(() => {
      messageService.add({
        severity: 'error',
        summary: translate.instant('errors.title'),
        detail: translate.instant('errors.default'),
        life: 5000
      });
    });
  }
}
