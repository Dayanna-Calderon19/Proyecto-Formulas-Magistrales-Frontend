import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  LucideUsers,
  LucideUserPlus,
  LucideSearch,
  LucideEye,
  LucideEyeOff,
  LucidePencil,
  LucideKeyRound,
  LucideCheckCircle,
  LucideBan,
  LucideLoaderCircle,
  LucideShield,
  LucideAlertTriangle,
  LucideCheck,
  LucideRefreshCw
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { UsuarioResponse, UsuarioCreateRequest, UsuarioUpdateRequest } from '../../core/models/usuario.model';
import { RolResponse } from '../../core/models/rol.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideUsers,
    LucideUserPlus,
    LucideSearch,
    LucideEye,
    LucideEyeOff,
    LucidePencil,
    LucideKeyRound,
    LucideCheckCircle,
    LucideBan,
    LucideLoaderCircle,
    LucideShield,
    LucideAlertTriangle,
    LucideCheck,
    LucideRefreshCw
  ],

  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  // Datos
  usuarios: UsuarioResponse[] = [];
  rolesDisponibles: RolResponse[] = [];
  loading = false;
  submitting = false;

  get currentUsername(): string | null {
    return this.authService.getUsername();
  }

  isCurrentUser(user: UsuarioResponse): boolean {
    return !!this.currentUsername && user.username === this.currentUsername;
  }

  isOtherAdmin(user: UsuarioResponse): boolean {
    const hasAdmin = user.roles.some(r => r.includes('ADMIN'));
    return hasAdmin && !this.isCurrentUser(user);
  }

  canEdit(user: UsuarioResponse): boolean {
    // Un administrador no puede editar los datos de otro administrador
    return !this.isOtherAdmin(user);
  }

  canResetPassword(user: UsuarioResponse): boolean {
    // Un administrador no puede restablecer la contraseña de otro administrador
    return !this.isOtherAdmin(user);
  }

  canDeactivate(user: UsuarioResponse): boolean {
    // No puede desactivar su propia cuenta en sesión
    if (this.isCurrentUser(user)) return false;
    // No puede desactivar a otro administrador
    if (this.isOtherAdmin(user)) return false;
    return true;
  }

  getEditDisabledReason(user: UsuarioResponse): string {
    if (this.isOtherAdmin(user)) {
      return 'Seguridad: No se permite modificar los datos ni el rol de otro administrador.';
    }
    return '';
  }

  getResetPasswordDisabledReason(user: UsuarioResponse): string {
    if (this.isOtherAdmin(user)) {
      return 'Seguridad: No se permite restablecer la contraseña de otro administrador.';
    }
    return '';
  }

  getDeactivateDisabledReason(user: UsuarioResponse): string {
    if (this.isCurrentUser(user)) {
      return 'Seguridad: No puedes desactivar tu propia cuenta mientras estás en sesión activa.';
    }
    if (this.isOtherAdmin(user)) {
      return 'Seguridad: No se permite desactivar a otro administrador.';
    }
    return '';
  }

  // Filtros
  searchTerm = '';
  filtroRol = 'TODOS';
  filtroEstado = 'TODOS';

  // Mensajes de notificación
  successMessage = '';
  errorMessage = '';

  // Modales
  showCreateModal = false;
  showEditModal = false;
  showDetailModal = false;
  showResetPasswordModal = false;
  showConfirmStatusModal = false;

  // Usuario seleccionado para ver/editar/cambiar estado
  selectedUser: UsuarioResponse | null = null;
  statusTargetUser: UsuarioResponse | null = null;

  // Control de visibilidad de contraseñas
  showPasswordText = false;
  showConfirmPasswordText = false;

  // Formularios
  createForm!: FormGroup;
  editForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.cargarRoles();
    this.cargarUsuarios();
  }

  private initForms(): void {
    // Formulario de creación
    this.createForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9_.-]+$')
      ]],
      nombreCompleto: ['', [
        Validators.maxLength(150)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordPolicyValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      rol: ['MEDICO', [Validators.required]],
      activo: [true]
    }, { validators: this.passwordMatchValidator });

    // Formulario de edición (sin contraseña)
    this.editForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9_.-]+$')
      ]],
      nombreCompleto: ['', [
        Validators.maxLength(150)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]],
      rol: ['MEDICO', [Validators.required]],
      activo: [true, [Validators.required]]
    });

    // Formulario de cambio de contraseña
    this.passwordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordPolicyValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para la política de contraseñas: al menos una letra y un dígito
  private passwordPolicyValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const hasLetter = /[a-zA-Z]/.test(control.value);
    const hasNumber = /\d/.test(control.value);
    if (!hasLetter || !hasNumber) {
      return { passwordPolicy: true };
    }
    return null;
  }

  // Validador de coincidencia de contraseñas
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (pass && confirm && pass !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    let activoParam: boolean | undefined = undefined;
    if (this.filtroEstado === 'ACTIVO') activoParam = true;
    if (this.filtroEstado === 'INACTIVO') activoParam = false;

    this.usuarioService.listarUsuarios(this.searchTerm, this.filtroRol, activoParam).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        if (err.name === 'TimeoutError') {
          this.errorMessage = 'El servidor tardó demasiado en responder (tiempo de espera agotado). Verifica que el servicio backend esté en ejecución.';
        } else if (err.status === 401) {
          this.errorMessage = 'Su sesión ha expirado o no está autenticado. Redirigiendo al inicio de sesión...';
        } else if (err.status === 403) {
          this.errorMessage = 'Acceso denegado: solo usuarios con rol de administrador (ADMIN) tienen autorización para gestionar cuentas y roles.';
        } else {
          this.errorMessage = err.error?.message || 'Error al conectar con el servidor de usuarios';
        }
        this.cdr.markForCheck();
      }
    });
  }


  cargarRoles(): void {
    this.rolService.listarRoles().subscribe({
      next: (roles) => {
        this.rolesDisponibles = roles;
        this.cdr.markForCheck();
      },
      error: () => {
        // En caso de que el endpoint no responda, proveer al menos los dos roles oficiales del sistema
        this.rolesDisponibles = [
          { idRol: 1, nombre: 'ADMIN' },
          { idRol: 2, nombre: 'MEDICO' }
        ];
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.cargarUsuarios();
  }

  onFilterRol(event: Event): void {
    this.filtroRol = (event.target as HTMLSelectElement).value;
    this.cargarUsuarios();
  }

  onFilterEstado(event: Event): void {
    this.filtroEstado = (event.target as HTMLSelectElement).value;
    this.cargarUsuarios();
  }

  // Apertura de Modales
  openCreateModal(): void {
    this.createForm.reset({
      username: '',
      nombreCompleto: '',
      correo: '',
      password: '',
      confirmPassword: '',
      rol: 'MEDICO',
      activo: true
    });
    this.showPasswordText = false;
    this.showConfirmPasswordText = false;
    this.showCreateModal = true;
    this.errorMessage = '';
  }

  openEditModal(user: UsuarioResponse): void {
    if (!this.canEdit(user)) {
      this.errorMessage = this.getEditDisabledReason(user);
      return;
    }
    this.selectedUser = user;
    const mainRole = user.roles.length > 0 ? user.roles[0].replace('ROLE_', '') : 'MEDICO';
    this.editForm.patchValue({
      username: user.username,
      nombreCompleto: user.nombreCompleto || '',
      correo: user.correo,
      rol: mainRole,
      activo: user.activo
    });
    this.showEditModal = true;
    this.errorMessage = '';
  }

  openDetailModal(user: UsuarioResponse): void {
    this.selectedUser = user;
    this.showDetailModal = true;
  }

  openResetPasswordModal(user: UsuarioResponse): void {
    if (!this.canResetPassword(user)) {
      this.errorMessage = this.getResetPasswordDisabledReason(user);
      return;
    }
    this.selectedUser = user;
    this.passwordForm.reset({
      password: '',
      confirmPassword: ''
    });
    this.showPasswordText = false;
    this.showConfirmPasswordText = false;
    this.showResetPasswordModal = true;
    this.errorMessage = '';
  }

  openConfirmStatusModal(user: UsuarioResponse): void {
    if (user.activo && !this.canDeactivate(user)) {
      this.errorMessage = this.getDeactivateDisabledReason(user);
      return;
    }
    this.statusTargetUser = user;
    this.showConfirmStatusModal = true;
    this.errorMessage = '';
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDetailModal = false;
    this.showResetPasswordModal = false;
    this.showConfirmStatusModal = false;
    this.selectedUser = null;
    this.statusTargetUser = null;
  }

  // Acciones de Formulario
  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const formVal = this.createForm.value;

    const req: UsuarioCreateRequest = {
      username: formVal.username.trim(),
      nombreCompleto: formVal.nombreCompleto ? formVal.nombreCompleto.trim() : undefined,
      correo: formVal.correo.trim().toLowerCase(),
      password: formVal.password,
      roles: [formVal.rol],
      activo: formVal.activo
    };

    this.usuarioService.registrarUsuario(req).subscribe({
      next: (created) => {
        this.submitting = false;
        this.closeModals();
        this.showSuccess(`Usuario '${created.username}' registrado exitosamente.`);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'No se pudo registrar el usuario';
      }
    });
  }

  submitEdit(): void {
    if (this.editForm.invalid || !this.selectedUser) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formVal = this.editForm.value;

    // Validación de autoprotección en cliente
    if (this.isCurrentUser(this.selectedUser)) {
      if (!formVal.activo) {
        this.errorMessage = 'No puedes desactivar tu propia cuenta en sesión activa.';
        return;
      }
      if (formVal.rol !== 'ADMIN') {
        this.errorMessage = 'No puedes retirar tus propios privilegios de administrador.';
        return;
      }
    }

    this.submitting = true;
    this.errorMessage = '';

    const req: UsuarioUpdateRequest = {
      username: formVal.username.trim(),
      nombreCompleto: formVal.nombreCompleto ? formVal.nombreCompleto.trim() : undefined,
      correo: formVal.correo.trim().toLowerCase(),
      roles: [formVal.rol],
      activo: formVal.activo
    };

    this.usuarioService.actualizarUsuario(this.selectedUser.idUsuario, req).subscribe({
      next: (updated) => {
        this.submitting = false;
        this.closeModals();
        this.showSuccess(`Usuario '${updated.username}' actualizado correctamente.`);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'Error al actualizar el usuario';
      }
    });
  }

  submitResetPassword(): void {
    if (this.passwordForm.invalid || !this.selectedUser) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const newPass = this.passwordForm.value.password;

    this.usuarioService.restablecerPassword(this.selectedUser.idUsuario, { password: newPass }).subscribe({
      next: () => {
        this.submitting = false;
        const targetName = this.selectedUser?.username;
        this.closeModals();
        this.showSuccess(`Contraseña del usuario '${targetName}' restablecida con éxito.`);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Error al restablecer la contraseña';
      }
    });
  }

  confirmToggleStatus(): void {
    if (!this.statusTargetUser) return;
    this.submitting = true;
    this.errorMessage = '';

    const user = this.statusTargetUser;
    const action$ = user.activo
      ? this.usuarioService.desactivarUsuario(user.idUsuario)
      : this.usuarioService.activarUsuario(user.idUsuario);

    action$.subscribe({
      next: () => {
        this.submitting = false;
        const newStatus = !user.activo ? 'activado' : 'desactivado';
        this.closeModals();
        this.showSuccess(`Usuario '${user.username}' ${newStatus} con éxito.`);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'No fue posible cambiar el estado del usuario';
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 4500);
  }
}
