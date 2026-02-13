import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { Auth } from './auth';
import { environment } from '../../../environments/environment';

describe('Auth', () => {
  let service: Auth;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set token on login', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const promise = firstValueFrom(service.login({ email: 'a@b.com', password: '12345678' }));

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Account/Login`);
    req.flush({
      statusCode: 200,
      succeeded: true,
      message: 'OK',
      errors: [],
      data: {
        id: '1',
        fullName: 'Test User',
        email: 'a@b.com',
        token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwiZW1haWwiOiJhQGIuY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.'
      }
    });
    const success = await promise;
    expect(success).toBe(true);
    expect(setItemSpy).toHaveBeenCalled();
  });
});
