import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideStethoscope,
  LucideCalendar,
  LucideClipboardList,
  LucideFlaskConical,
  LucideUserCog,
  LucideShield,
  LucideChevronLeft,
  LucideChevronRight,
  LucideX
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';

/**
 * Menú lateral de navegación con soporte para:
 * - Colapso/expansión en escritorio (signals en LayoutService).
 * - Despliegue en modo drawer/overlay en dispositivos móviles.
 * - Enrutamiento Angular con routerLink y routerLinkActive.
 * - Control de visibilidad según roles de usuario (ADMIN vs MEDICO u otros).
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideUsers,
    LucideStethoscope,
    LucideCalendar,
    LucideClipboardList,
    LucideFlaskConical,
    LucideUserCog,
    LucideShield,
    LucideChevronLeft,
    LucideChevronRight,
    LucideX
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  readonly layoutService = inject(LayoutService);
  private readonly authService = inject(AuthService);

  /**
   * Al hacer click en una opción del menú, si estamos en vista móvil,
   * se cierra automáticamente el menú lateral.
   */
  onNavigate(): void {
    if (this.layoutService.isMobileOpen()) {
      this.layoutService.closeMobile();
    }
  }

  /**
   * Determina si el usuario tiene acceso a las opciones administrativas (Usuarios, Roles).
   * Si no hay roles configurados o si el rol contiene ADMIN, se permite el acceso.
   */
  canAccessAdmin(): boolean {
    const roles = this.authService.getRoles();
    if (roles.length === 0) return false;
    return this.authService.hasRole('ADMIN');
  }
}
