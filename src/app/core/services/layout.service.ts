import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  sidebarVisible = signal<boolean>(true);

  toggleSidebar() {
    this.sidebarVisible.update(v => !v);
  }

  setSidebarState(state: boolean) {
    this.sidebarVisible.set(state);
  }
}
