import { ErrorHandler, Injectable, Injector, NgZone, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);
  private zone = inject(NgZone);

  handleError(error: unknown): void {
    const messageService = this.injector.get(MessageService);
    const translate = this.injector.get(TranslateService);

    console.error('GlobalErrorHandler caught an error:', error);

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
