import { Component, inject, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideMenu,
  LucideUser,
  LucideLogOut,
  LucideHospital,
  LucideChevronDown,
  LucideKeyRound,
  LucideEye,
  LucideEyeOff,
  LucideShield,
  LucideCheck,
  LucideCheckCircle,
  LucideAlertTriangle,
  LucideX,
  LucideLoaderCircle,
  LucideStethoscope,
  LucideCalendar,
  LucideMail,
  LucidePhone
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { PerfilService } from '../../core/services/perfil.service';
import { PerfilResponse } from '../../core/models/perfil.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideMenu,
    LucideUser,
    LucideLogOut,
    LucideHospital,
    LucideChevronDown,
    LucideKeyRound,
    LucideEye,
    LucideEyeOff,
    LucideShield,
    LucideCheck,
    LucideCheckCircle,
    LucideAlertTriangle,
    LucideX,
    LucideLoaderCircle,
    LucideStethoscope,
    LucideCalendar,
    LucideMail,
    LucidePhone
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  readonly layoutService = inject(LayoutService);
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilService);
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  // Estado del menú desplegable de usuario
  isDropdownOpen = false;

  // Estados de modales
  showPerfilModal = false;
  showPasswordModal = false;

  // Datos del perfil
  loadingPerfil = false;
  perfil: PerfilResponse | null = null;
  perfilError = '';

  // Datos para cambio de contraseña propio
  passwordActual = '';
  passwordNuevo = '';
  passwordConfirm = '';
  showActualPass = false;
  showNuevoPass = false;
  showConfirmPass = false;
  passwordSubmitting = false;
  passwordError = '';
  passwordSuccess = '';

  get username(): string | null {
    return this.authService.getUsername();
  }

  get userRoles(): string[] {
    return this.authService.getRoles();
  }

  get primaryRole(): string {
    const roles = this.userRoles;
    if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) return 'ADMIN';
    if (roles.includes('MEDICO') || roles.includes('ROLE_MEDICO')) return 'MEDICO';
    return roles.length > 0 ? roles[0].replace('ROLE_', '') : 'USUARIO';
  }

  // Cerrar menú al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  // Cerrar menú o modales con ESC
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    } else if (this.showPasswordModal) {
      this.cerrarPasswordModal();
    } else if (this.showPerfilModal) {
      this.cerrarPerfilModal();
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  abrirMiPerfil(): void {
    this.isDropdownOpen = false;
    this.showPerfilModal = true;
    this.loadingPerfil = true;
    this.perfilError = '';
    this.perfil = null;
    this.cdr.markForCheck();

    this.perfilService.obtenerPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.loadingPerfil = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loadingPerfil = false;
        this.perfilError = err.error?.message || 'No fue posible cargar los datos del perfil.';
        this.cdr.markForCheck();
      }
    });
  }

  cerrarPerfilModal(): void {
    this.showPerfilModal = false;
    this.perfil = null;
    this.perfilError = '';
  }

  abrirCambiarPassword(): void {
    this.isDropdownOpen = false;
    this.showPasswordModal = true;
    this.passwordActual = '';
    this.passwordNuevo = '';
    this.passwordConfirm = '';
    this.showActualPass = false;
    this.showNuevoPass = false;
    this.showConfirmPass = false;
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  cerrarPasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordActual = '';
    this.passwordNuevo = '';
    this.passwordConfirm = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  // Validaciones del formulario de cambio de contraseña propio
  validarPassword(): string | null {
    if (!this.passwordActual.trim()) {
      return 'Debes ingresar tu contraseña actual.';
    }
    if (!this.passwordNuevo.trim()) {
      return 'Debes ingresar la nueva contraseña.';
    }
    if (this.passwordNuevo.length < 8) {
      return 'La nueva contraseña debe tener como mínimo 8 caracteres.';
    }
    const hasLetter = /[a-zA-Z]/.test(this.passwordNuevo);
    const hasNumber = /\d/.test(this.passwordNuevo);
    if (!hasLetter || !hasNumber) {
      return 'La nueva contraseña debe combinar al menos una letra y un número.';
    }
    if (this.passwordNuevo === this.passwordActual) {
      return 'La nueva contraseña no puede ser igual a la contraseña actual.';
    }
    if (this.passwordNuevo !== this.passwordConfirm) {
      return 'La confirmación de la contraseña no coincide con la nueva contraseña.';
    }
    return null;
  }

  submitCambioPassword(): void {
    const error = this.validarPassword();
    if (error) {
      this.passwordError = error;
      this.passwordSuccess = '';
      return;
    }

    this.passwordSubmitting = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    this.perfilService.cambiarPassword({
      passwordActual: this.passwordActual,
      passwordNuevo: this.passwordNuevo
    }).subscribe({
      next: (res) => {
        this.passwordSubmitting = false;
        this.passwordSuccess = res.message || 'Contraseña actualizada exitosamente.';
        this.passwordActual = '';
        this.passwordNuevo = '';
        this.passwordConfirm = '';
        this.cdr.markForCheck();
        setTimeout(() => {
          if (this.showPasswordModal) {
            this.cerrarPasswordModal();
          }
        }, 2200);
      },
      error: (err) => {
        this.passwordSubmitting = false;
        this.passwordError = err.error?.message || err.error?.error || 'Error al actualizar la contraseña.';
        this.cdr.markForCheck();
      }
    });
  }

  onLogout(): void {
    this.isDropdownOpen = false;
    this.authService.logout();
  }
}
