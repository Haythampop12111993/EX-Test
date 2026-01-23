import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Injector, NgZone } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let messageServiceSpy: { add: any };
  let translateServiceSpy: { instant: any };
  let ngZone: NgZone;

  beforeEach(() => {
    messageServiceSpy = { add: vi.fn() };
    translateServiceSpy = { instant: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        {
            provide: Injector,
            useValue: {
                get: (token: any) => {
                    if (token === MessageService) return messageServiceSpy;
                    if (token === TranslateService) return translateServiceSpy;
                    return null;
                }
            }
        }
      ]
    });

    handler = TestBed.inject(GlobalErrorHandler);
    ngZone = TestBed.inject(NgZone);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('should handle error and display toast message', () => {
    const error = new Error('Test Error');
    translateServiceSpy.instant.mockImplementation((key: string) => {
        if (key === 'errors.title') return 'Error Title';
        if (key === 'errors.default') return 'Default Error Message';
        return key;
    });

    vi.spyOn(console, 'error').mockImplementation(() => {}); // Prevent console error output
    vi.spyOn(ngZone, 'run').mockImplementation((fn: any) => fn());

    handler.handleError(error);

    expect(console.error).toHaveBeenCalledWith('GlobalErrorHandler caught an error:', error);
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('errors.title');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('errors.default');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error Title',
      detail: 'Default Error Message',
      life: 5000
    });
  });
});
