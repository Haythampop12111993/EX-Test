import { Injectable, signal, inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private spinner = inject(NgxSpinnerService);
  private loadingMap = new Map<string, boolean>();
  isLoading = signal<boolean>(false);

  setLoading(loading: boolean, url: string): void {
    if (!url) return;

    if (loading) {
      this.loadingMap.set(url, loading);
      this.isLoading.set(true);
      this.spinner.show();
    } else if (!loading && this.loadingMap.has(url)) {
      this.loadingMap.delete(url);
    }
    
    // If map is empty, loading is complete
    if (this.loadingMap.size === 0) {
      this.isLoading.set(false);
      this.spinner.hide();
    }
  }
}
