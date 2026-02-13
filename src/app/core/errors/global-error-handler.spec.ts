import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Injector, NgZone } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';

type MessageAddFn = (value: unknown) => void;
type TranslateInstantFn = (key: string, params?: Record<string, unknown>) => string;

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let messageServiceSpy: { add: ReturnType<typeof vi.fn<MessageAddFn>> };
  let translateServiceSpy: { instant: ReturnType<typeof vi.fn<TranslateInstantFn>> };
  let ngZone: NgZone;

  beforeEach(() => {
    messageServiceSpy = { add: vi.fn<MessageAddFn>() };
    translateServiceSpy = { instant: vi.fn<TranslateInstantFn>() };

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        {
            provide: Injector,
            useValue: {
                get: (token: unknown) => {
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

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(ngZone, 'run').mockImplementation((fn: () => unknown) => fn());

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
