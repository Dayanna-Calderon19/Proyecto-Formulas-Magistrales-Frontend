import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import {
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
  LucideMapPin,
  LucideClipboardList,
  LucideStethoscope,
  LucideTrash2
} from '@lucide/angular';
import { PacienteService } from '../../core/services/paciente.service';
import { AuthService } from '../../core/services/auth.service';
import { PacienteResponse, PacienteRequest, ConsultaHistorial } from '../../core/models/paciente.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    LucideMapPin,
    LucideClipboardList,
    LucideStethoscope,
    LucideTrash2
  ],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  // Datos
  pacientes: PacienteResponse[] = [];
  historialConsultas: ConsultaHistorial[] = [];
  loading = false;
  submitting = false;
  loadingHistory = false;

  // Filtros
  searchTerm = '';
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

  // Paciente seleccionado
  selectedPaciente: PacienteResponse | null = null;
  statusTargetPaciente: PacienteResponse | null = null;
  pacienteAEliminar: PacienteResponse | null = null;

  // Formularios
  createForm!: FormGroup;
  editForm!: FormGroup;

  // Fecha máxima para el picker (hoy)
  todayDateStr: string = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.initForms();
    this.cargarPacientes();
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
      fechaNacimiento: ['', [
        Validators.required,
        this.noFutureDateValidator
      ]],
      sexo: ['MASCULINO', [Validators.required]],
      telefono: ['', [
        Validators.pattern('^[0-9+()\\s-]{7,20}$')
      ]],
      correo: ['', [
        Validators.email,
        Validators.maxLength(150)
      ]],
      direccion: ['', [
        Validators.maxLength(255)
      ]],
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
      fechaNacimiento: ['', [
        Validators.required,
        this.noFutureDateValidator
      ]],
      sexo: ['MASCULINO', [Validators.required]],
      telefono: ['', [
        Validators.pattern('^[0-9+()\\s-]{7,20}$')
      ]],
      correo: ['', [
        Validators.email,
        Validators.maxLength(150)
      ]],
      direccion: ['', [
        Validators.maxLength(255)
      ]],
      estado: [true, [Validators.required]]
    });
  }

  private noFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      return { futureDate: true };
    }
    return null;
  }

  cargarPacientes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    let estadoParam: boolean | undefined = undefined;
    if (this.filtroEstado === 'ACTIVO') estadoParam = true;
    if (this.filtroEstado === 'INACTIVO') estadoParam = false;

    this.pacienteService.listarPacientes(this.searchTerm, estadoParam).subscribe({
      next: (data) => {
        this.pacientes = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMessage = 'Su sesión ha expirado. Inicie sesión nuevamente.';
        } else if (err.status === 403) {
          this.errorMessage = 'Acceso denegado: no cuenta con autorización para consultar la lista de pacientes.';
        } else {
          this.errorMessage = err.error?.message || 'Error al conectar con el servidor para consultar pacientes.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.cargarPacientes();
  }

  onFilterEstado(event: Event): void {
    this.filtroEstado = (event.target as HTMLSelectElement).value;
    this.cargarPacientes();
  }

  // Modales
  openCreateModal(): void {
    this.createForm.reset({
      dni: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      sexo: 'MASCULINO',
      telefono: '',
      correo: '',
      direccion: '',
      estado: true
    });
    this.errorMessage = '';
    this.showCreateModal = true;
  }

  openEditModal(paciente: PacienteResponse): void {
    this.selectedPaciente = paciente;
    this.editForm.patchValue({
      dni: paciente.dni,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      fechaNacimiento: paciente.fechaNacimiento,
      sexo: paciente.sexo || 'MASCULINO',
      telefono: paciente.telefono || '',
      correo: paciente.correo || '',
      direccion: paciente.direccion || '',
      estado: paciente.estado
    });
    this.errorMessage = '';
    this.showEditModal = true;
  }

  openDetailModal(paciente: PacienteResponse): void {
    this.selectedPaciente = paciente;
    this.historialConsultas = [];
    this.showDetailModal = true;
    this.cargarHistorial(paciente.idPaciente);
  }

  openConfirmStatusModal(paciente: PacienteResponse): void {
    this.statusTargetPaciente = paciente;
    this.errorMessage = '';
    this.showConfirmStatusModal = true;
  }

  openDeleteModal(paciente: PacienteResponse): void {
    this.pacienteAEliminar = paciente;
    this.errorMessage = '';
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.pacienteAEliminar = null;
  }

  confirmDelete(): void {
    if (!this.pacienteAEliminar) return;
    this.submitting = true;
    this.errorMessage = '';
    const p = this.pacienteAEliminar;

    this.pacienteService.eliminarPaciente(p.idPaciente).subscribe({
      next: (res) => {
        this.submitting = false;
        this.closeDeleteModal();
        this.showSuccess(res.message || `Paciente '${p.nombres} ${p.apellidos}' eliminado exitosamente.`);
        this.cargarPacientes();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'No fue posible eliminar al paciente debido a restricciones de integridad referencial. Utilice la desactivación en su lugar.';
      }
    });
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDetailModal = false;
    this.showConfirmStatusModal = false;
    this.showDeleteModal = false;
    this.selectedPaciente = null;
    this.statusTargetPaciente = null;
    this.pacienteAEliminar = null;
    this.historialConsultas = [];
  }

  cargarHistorial(idPaciente: number): void {
    this.loadingHistory = true;
    this.pacienteService.obtenerHistorial(idPaciente).subscribe({
      next: (data) => {
        this.historialConsultas = data;
        this.loadingHistory = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.historialConsultas = [];
        this.loadingHistory = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Envíos de Formularios
  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const formVal = this.createForm.value;

    const req: PacienteRequest = {
      dni: formVal.dni.trim(),
      nombres: formVal.nombres.trim(),
      apellidos: formVal.apellidos.trim(),
      fechaNacimiento: formVal.fechaNacimiento,
      sexo: formVal.sexo,
      telefono: formVal.telefono ? formVal.telefono.trim() : undefined,
      correo: formVal.correo ? formVal.correo.trim().toLowerCase() : undefined,
      direccion: formVal.direccion ? formVal.direccion.trim() : undefined,
      estado: formVal.estado
    };

    this.pacienteService.registrarPaciente(req).subscribe({
      next: (created) => {
        this.submitting = false;
        this.closeModals();
        this.showSuccess(`Paciente '${created.nombres} ${created.apellidos}' registrado con éxito.`);
        this.cargarPacientes();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'No fue posible registrar al paciente.';
      }
    });
  }

  submitEdit(): void {
    if (this.editForm.invalid || !this.selectedPaciente) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const formVal = this.editForm.value;

    const req: PacienteRequest = {
      dni: formVal.dni.trim(),
      nombres: formVal.nombres.trim(),
      apellidos: formVal.apellidos.trim(),
      fechaNacimiento: formVal.fechaNacimiento,
      sexo: formVal.sexo,
      telefono: formVal.telefono ? formVal.telefono.trim() : undefined,
      correo: formVal.correo ? formVal.correo.trim().toLowerCase() : undefined,
      direccion: formVal.direccion ? formVal.direccion.trim() : undefined,
      estado: formVal.estado
    };

    this.pacienteService.actualizarPaciente(this.selectedPaciente.idPaciente, req).subscribe({
      next: (updated) => {
        this.submitting = false;
        this.closeModals();
        this.showSuccess(`Datos del paciente '${updated.nombres} ${updated.apellidos}' actualizados correctamente.`);
        this.cargarPacientes();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'No fue posible actualizar al paciente.';
      }
    });
  }

  confirmToggleStatus(): void {
    if (!this.statusTargetPaciente) return;
    this.submitting = true;
    this.errorMessage = '';

    const p = this.statusTargetPaciente;
    const action$ = p.estado
      ? this.pacienteService.desactivarPaciente(p.idPaciente)
      : this.pacienteService.activarPaciente(p.idPaciente);

    action$.subscribe({
      next: () => {
        this.submitting = false;
        const nuevoEstado = !p.estado ? 'activado' : 'desactivado';
        this.closeModals();
        this.showSuccess(`Paciente '${p.nombres} ${p.apellidos}' ${nuevoEstado} con éxito.`);
        this.cargarPacientes();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'No fue posible cambiar el estado del paciente.';
      }
    });
  }

  calcularEdad(fechaNacimientoStr: string): number | string {
    if (!fechaNacimientoStr) return '-';
    const nac = new Date(fechaNacimientoStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad >= 0 ? `${edad} años` : '-';
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 4500);
  }
}
