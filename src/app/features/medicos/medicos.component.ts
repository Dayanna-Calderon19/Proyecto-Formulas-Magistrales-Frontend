import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  LucideStethoscope,
  LucideUsers,
  LucideUserPlus,
  LucideSearch,
  LucideEye,
  LucidePencil,
  LucideCheckCircle,
  LucideBan,
  LucideLoaderCircle,
  LucideAlertTriangle,
  LucideCheck,
  LucideRefreshCw,
  LucideCalendar,
  LucidePhone,
  LucideMail,
  LucideAward,
  LucideUserCheck,
  LucideUserX,
  LucideClipboardList,
  LucideTrash2
} from '@lucide/angular';
import { MedicoService } from '../../core/services/medico.service';
import { AuthService } from '../../core/services/auth.service';
import { MedicoResponse, MedicoRequest } from '../../core/models/medico.model';
import { ConsultaHistorial } from '../../core/models/paciente.model';
import { UsuarioResponse } from '../../core/models/usuario.model';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideStethoscope,
    LucideUsers,
    LucideUserPlus,
    LucideSearch,
    LucideEye,
    LucidePencil,
    LucideCheckCircle,
    LucideBan,
    LucideLoaderCircle,
    LucideAlertTriangle,
    LucideCheck,
    LucideRefreshCw,
    LucideCalendar,
    LucidePhone,
    LucideMail,
    LucideAward,
    LucideUserCheck,
    LucideUserX,
    LucideClipboardList,
    LucideTrash2
  ],
  templateUrl: './medicos.component.html',
  styleUrls: ['./medicos.component.css']
})
export class MedicosComponent implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  // Datos
  medicos: MedicoResponse[] = [];
  especialidades: string[] = [];
  usuariosDisponibles: UsuarioResponse[] = [];
  consultasAtendidas: ConsultaHistorial[] = [];

  loading = false;
  submitting = false;
  loadingHistory = false;

  // Filtros
  searchTerm = '';
  filtroEspecialidad = 'TODAS';
  filtroEstado = 'TODOS';

  // Mensajes de notificación
  successMessage = '';
  errorMessage = '';

  // Modales
  showCreateModal = false;
  showEditModal = false;
  showDetailModal = false;
  showConfirmStatusModal = false;
  showDeleteModal = false;

  // Médico seleccionado
  selectedMedico: MedicoResponse | null = null;
  statusTargetMedico: MedicoResponse | null = null;
  medicoAEliminar: MedicoResponse | null = null;

  // Formularios
  createForm!: FormGroup;
  editForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.cargarEspecialidades();
    this.cargarMedicos();
  }

  canManageAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  private initForms(): void {
    // Formulario de creación
    this.createForm = this.fb.group({
      dni: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{8}$'),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      nombres: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$')
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$')
      ]],
      colegiatura: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern('^[a-zA-Z0-9-]+$')
      ]],
      especialidad: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      telefono: ['', [
        Validators.pattern('^[0-9+()\\s-]{7,20}$')
      ]],
      correo: ['', [
        Validators.email,
        Validators.maxLength(150)
      ]],
      idUsuario: [null],
      estado: [true]
    });

    // Formulario de edición
    this.editForm = this.fb.group({
      dni: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{8}$'),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      nombres: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$')
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$')
      ]],
      colegiatura: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern('^[a-zA-Z0-9-]+$')
      ]],
      especialidad: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      telefono: ['', [
        Validators.pattern('^[0-9+()\\s-]{7,20}$')
      ]],
      correo: ['', [
        Validators.email,
        Validators.maxLength(150)
      ]],
      idUsuario: [null],
      estado: [true, [Validators.required]]
    });
  }

  cargarMedicos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    let estadoParam: boolean | undefined = undefined;
    if (this.filtroEstado === 'ACTIVO') estadoParam = true;
    if (this.filtroEstado === 'INACTIVO') estadoParam = false;

    this.medicoService.listarMedicos(this.searchTerm, this.filtroEspecialidad, estadoParam).subscribe({
      next: (data) => {
        this.medicos = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMessage = 'Su sesión ha expirado. Inicie sesión nuevamente.';
        } else if (err.status === 403) {
          this.errorMessage = 'Acceso denegado: no cuenta con autorización para consultar la lista de médicos.';
        } else {
          this.errorMessage = err.error?.message || 'Error al conectar con el servidor para consultar médicos.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  cargarEspecialidades(): void {
    this.medicoService.listarEspecialidades().subscribe({
      next: (data) => {
        this.especialidades = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.especialidades = [];
      }
    });
  }

  cargarUsuariosDisponibles(): void {
    if (!this.canManageAdmin()) return;
    this.medicoService.listarUsuariosDisponibles().subscribe({
      next: (data) => {
        this.usuariosDisponibles = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.usuariosDisponibles = [];
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.cargarMedicos();
  }

  onFilterEspecialidad(event: Event): void {
    this.filtroEspecialidad = (event.target as HTMLSelectElement).value;
    this.cargarMedicos();
  }

  onFilterEstado(event: Event): void {
    this.filtroEstado = (event.target as HTMLSelectElement).value;
    this.cargarMedicos();
  }

  // Modales
  openCreateModal(): void {
    this.createForm.reset({
      dni: '',
      nombres: '',
      apellidos: '',
      colegiatura: '',
      especialidad: '',
      telefono: '',
      correo: '',
      idUsuario: null,
      estado: true
    });
    this.errorMessage = '';
    this.cargarUsuariosDisponibles();
    this.showCreateModal = true;
  }

  openEditModal(medico: MedicoResponse): void {
    this.selectedMedico = medico;
    this.editForm.patchValue({
      dni: medico.dni,
      nombres: medico.nombres,
      apellidos: medico.apellidos,
      colegiatura: medico.colegiatura,
      especialidad: medico.especialidad,
      telefono: medico.telefono || '',
      correo: medico.correo || '',
      idUsuario: medico.idUsuario || null,
      estado: medico.estado
    });
    this.errorMessage = '';
    this.cargarUsuariosDisponibles();
    this.showEditModal = true;
  }

  openDetailModal(medico: MedicoResponse): void {
    this.selectedMedico = medico;
    this.consultasAtendidas = [];
    this.showDetailModal = true;
    this.cargarConsultasMedico(medico.idMedico);
  }

  openConfirmStatusModal(medico: MedicoResponse): void {
    this.statusTargetMedico = medico;
    this.errorMessage = '';
    this.showConfirmStatusModal = true;
  }

  openDeleteModal(medico: MedicoResponse): void {
    this.medicoAEliminar = medico;
    this.errorMessage = '';
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.medicoAEliminar = null;
  }

  confirmDelete(): void {
    if (!this.medicoAEliminar) return;
    this.submitting = true;
    this.errorMessage = '';
    const m = this.medicoAEliminar;

    this.medicoService.eliminarMedico(m.idMedico).subscribe({
      next: (res) => {
        this.submitting = false;
        this.closeDeleteModal();
        this.showSuccess(res.message || `Médico Dr.(a) '${m.nombres} ${m.apellidos}' eliminado exitosamente.`);
        this.cargarMedicos();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'No fue posible eliminar al médico debido a restricciones de integridad referencial. Utilice la desactivación en su lugar.';
      }
    });
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDetailModal = false;
    this.showConfirmStatusModal = false;
    this.showDeleteModal = false;
    this.selectedMedico = null;
    this.statusTargetMedico = null;
    this.medicoAEliminar = null;
    this.consultasAtendidas = [];
  }

  cargarConsultasMedico(idMedico: number): void {
    this.loadingHistory = true;
    this.medicoService.obtenerConsultasMedico(idMedico).subscribe({
      next: (data) => {
        this.consultasAtendidas = data;
        this.loadingHistory = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.consultasAtendidas = [];
        this.loadingHistory = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Envíos de Formulario
  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const formVal = this.createForm.value;

    const req: MedicoRequest = {
      dni: formVal.dni.trim(),
      nombres: formVal.nombres.trim(),
      apellidos: formVal.apellidos.trim(),
      colegiatura: formVal.colegiatura.trim().toUpperCase(),
      especialidad: formVal.especialidad.trim(),
      telefono: formVal.telefono ? formVal.telefono.trim() : undefined,
      correo: formVal.correo ? formVal.correo.trim().toLowerCase() : undefined,
      idUsuario: formVal.idUsuario ? Number(formVal.idUsuario) : null,
      estado: formVal.estado
    };

    this.medicoService.registrarMedico(req).subscribe({
      next: (created) => {
        this.submitting = false;
        this.closeModals();
        this.showSuccess(`Médico Dr.(a) '${created.nombres} ${created.apellidos}' registrado con éxito.`);
        this.cargarMedicos();
        this.cargarEspecialidades();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'No fue posible registrar al médico.';
      }
    });
  }

  submitEdit(): void {
    if (this.editForm.invalid || !this.selectedMedico) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const formVal = this.editForm.value;

    const req: MedicoRequest = {
      dni: formVal.dni.trim(),
      nombres: formVal.nombres.trim(),
      apellidos: formVal.apellidos.trim(),
      colegiatura: formVal.colegiatura.trim().toUpperCase(),
      especialidad: formVal.especialidad.trim(),
      telefono: formVal.telefono ? formVal.telefono.trim() : undefined,
      correo: formVal.correo ? formVal.correo.trim().toLowerCase() : undefined,
      idUsuario: formVal.idUsuario ? Number(formVal.idUsuario) : null,
      estado: formVal.estado
    };

    this.medicoService.actualizarMedico(this.selectedMedico.idMedico, req).subscribe({
      next: (updated) => {
        this.submitting = false;
        this.closeModals();
        this.showSuccess(`Datos del médico Dr.(a) '${updated.nombres} ${updated.apellidos}' actualizados correctamente.`);
        this.cargarMedicos();
        this.cargarEspecialidades();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'No fue posible actualizar los datos del médico.';
      }
    });
  }

  confirmToggleStatus(): void {
    if (!this.statusTargetMedico) return;
    this.submitting = true;
    this.errorMessage = '';

    const m = this.statusTargetMedico;
    const action$ = m.estado
      ? this.medicoService.desactivarMedico(m.idMedico)
      : this.medicoService.activarMedico(m.idMedico);

    action$.subscribe({
      next: () => {
        this.submitting = false;
        const nuevoEstado = !m.estado ? 'activado' : 'desactivado';
        this.closeModals();
        this.showSuccess(`Médico Dr.(a) '${m.nombres} ${m.apellidos}' ${nuevoEstado} con éxito.`);
        this.cargarMedicos();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'No fue posible cambiar el estado del médico.';
      }
    });
  }

  desvincularCuentaUsuario(): void {
    if (!this.selectedMedico) return;
    if (!confirm(`¿Deseas desvincular la cuenta de usuario '${this.selectedMedico.username}' de este médico?`)) return;

    this.submitting = true;
    this.medicoService.desvincularUsuario(this.selectedMedico.idMedico).subscribe({
      next: (updated) => {
        this.submitting = false;
        this.selectedMedico = updated;
        this.editForm.patchValue({ idUsuario: null });
        this.showSuccess('Cuenta de usuario desvinculada exitosamente.');
        this.cargarMedicos();
        this.cargarUsuariosDisponibles();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Error al desvincular la cuenta de usuario.';
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
