import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  /** Estado de colapso del sidebar en escritorio */
  readonly isCollapsed = signal<boolean>(false);

  /** Estado de apertura del drawer lateral en dispositivos móviles */
  readonly isMobileOpen = signal<boolean>(false);

  toggleCollapsed(): void {
    this.isCollapsed.update(val => !val);
  }

  setCollapsed(collapsed: boolean): void {
    this.isCollapsed.set(collapsed);
  }

  toggleMobile(): void {
    this.isMobileOpen.update(val => !val);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  openMobile(): void {
    this.isMobileOpen.set(true);
  }
}
