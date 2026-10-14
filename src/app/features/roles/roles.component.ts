import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  LucideShield,
  LucideShieldPlus,
  LucideCheck,
  LucideAlertTriangle,
  LucideLoaderCircle
} from '@lucide/angular';
import { RolService } from '../../core/services/rol.service';
import { RolResponse } from '../../core/models/rol.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideShield,
    LucideShieldPlus,
    LucideCheck,
    LucideAlertTriangle,
    LucideLoaderCircle
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  private readonly rolService = inject(RolService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  roles: RolResponse[] = [];
  loading = false;
  submitting = false;

  showCreateModal = false;
  roleForm!: FormGroup;

  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.roleForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]]
    });
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    this.rolService.listarRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        if (err.name === 'TimeoutError') {
          this.errorMessage = 'El servidor tardó demasiado en responder (tiempo de espera agotado). Verifica que el servicio backend esté en ejecución.';
        } else if (err.status === 401) {
          this.errorMessage = 'Su sesión ha expirado o no tiene credenciales válidas.';
        } else if (err.status === 403) {
          this.errorMessage = 'Acceso restringido: se requieren permisos de Administrador para ver el catálogo.';
        } else {
          this.errorMessage = err.error?.message || 'Error al obtener el catálogo de roles del servidor.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  openCreateModal(): void {
    this.roleForm.reset({ nombre: '' });
    this.showCreateModal = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.cdr.markForCheck();
  }

  submitCreateRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    const nombre = this.roleForm.value.nombre.trim().toUpperCase();

    this.rolService.registrarRol({ nombre }).subscribe({
      next: (created) => {
        this.submitting = false;
        this.closeModal();
        this.successMessage = `Rol '${created.nombre}' creado exitosamente.`;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.markForCheck();
        }, 4000);
        this.cargarRoles();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'No se pudo crear el rol';
        this.cdr.markForCheck();
      }
    });
  }
}
