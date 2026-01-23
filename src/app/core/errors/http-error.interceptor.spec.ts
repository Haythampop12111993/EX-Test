import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { httpErrorInterceptor } from './http-error.interceptor';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('httpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let messageServiceSpy: { add: any };
  let translateServiceSpy: { instant: any };

  beforeEach(() => {
    messageServiceSpy = { add: vi.fn() };
    translateServiceSpy = { instant: vi.fn() };

    // Mock translate.instant to return the key or a specific message based on key
    translateServiceSpy.instant.mockImplementation((key: string, params?: any) => {
        if (key === 'errors.unknown') return 'An unknown error occurred!';
        if (key === 'errors.network') return `Network Error: ${params?.message}`;
        if (key === 'errors.unauthorized') return 'Unauthorized access. Please login again.';
        if (key === 'errors.forbidden') return 'You do not have permission to perform this action.';
        if (key === 'errors.notFound') return 'The requested resource was not found.';
        if (key === 'errors.server') return 'Server error. Please try again later.';
        if (key === 'errors.code') return `Error Code: ${params?.status} Message: ${params?.message}`;
        if (key === 'errors.title') return 'Error';
        return key;
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should handle 401 Unauthorized error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => { throw new Error('should have failed with the 401 error'); },
      error: (error: Error) => {
        expect(error.message).toBe('Unauthorized access. Please login again.');
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('errors.unauthorized');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      summary: 'Error',
      detail: 'Unauthorized access. Please login again.'
    }));
  });

  it('should handle 403 Forbidden error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => { throw new Error('should have failed with the 403 error'); },
      error: (error: Error) => {
        expect(error.message).toBe('You do not have permission to perform this action.');
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('errors.forbidden');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'You do not have permission to perform this action.'
    }));
  });

  it('should handle 404 Not Found error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => { throw new Error('should have failed with the 404 error'); },
      error: (error: Error) => {
        expect(error.message).toBe('The requested resource was not found.');
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('errors.notFound');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'The requested resource was not found.'
    }));
  });

  it('should handle 500 Server error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => { throw new Error('should have failed with the 500 error'); },
      error: (error: Error) => {
        expect(error.message).toBe('Server error. Please try again later.');
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('errors.server');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'Server error. Please try again later.'
    }));
  });

  it('should handle other error codes (e.g., 400)', () => {
    httpClient.get('/api/test').subscribe({
      next: () => { throw new Error('should have failed with the 400 error'); },
      error: (error: Error) => {
        expect(error.message).toBe('Error Code: 400 Message: Http failure response for /api/test: 400 Bad Request');
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('errors.code', { status: 400, message: 'Http failure response for /api/test: 400 Bad Request' });
    expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'Error Code: 400 Message: Http failure response for /api/test: 400 Bad Request'
    }));
  });

  it('should handle client-side/network error', () => {
    const errorEvent = new ErrorEvent('Network error', {
      message: 'Connection timed out',
    });

    httpClient.get('/api/test').subscribe({
      next: () => { throw new Error('should have failed with the network error'); },
      error: (error: Error) => {
        expect(error.message).toBe('Network Error: Connection timed out');
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.error(errorEvent);

    expect(translateServiceSpy.instant).toHaveBeenCalledWith('errors.network', { message: 'Connection timed out' });
    expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'Network Error: Connection timed out'
    }));
  });
});
