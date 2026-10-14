import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideCalendar,
  LucideClock,
  LucideCalendarClock,
  LucideSearch,
  LucidePlus,
  LucideEye,
  LucidePencil,
  LucideBan,
  LucideCheckCircle,
  LucideAlertTriangle,
  LucideRefreshCw,
  LucideLoaderCircle,
  LucideStethoscope,
  LucideClipboardList
} from '@lucide/angular';
import { CitasService } from '../../core/services/citas.service';
import { PacienteService } from '../../core/services/paciente.service';
import { MedicoService } from '../../core/services/medico.service';
import { AuthService } from '../../core/services/auth.service';
import { CitaResponse, CitaRequest, CitaReprogramarRequest, CitasStats } from '../../core/models/citas.model';
import { PacienteResponse } from '../../core/models/paciente.model';
import { MedicoResponse } from '../../core/models/medico.model';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideCalendar,
    LucideClock,
    LucideCalendarClock,
    LucideSearch,
    LucidePlus,
    LucideEye,
    LucidePencil,
    LucideBan,
    LucideCheckCircle,
    LucideAlertTriangle,
    LucideRefreshCw,
    LucideLoaderCircle,
    LucideStethoscope,
    LucideClipboardList
  ],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  private readonly citasService = inject(CitasService);
  private readonly pacienteService = inject(PacienteService);
  private readonly medicoService = inject(MedicoService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Listas de datos
  citas: CitaResponse[] = [];
  pacientesDisponibles: PacienteResponse[] = [];
  medicosDisponibles: MedicoResponse[] = [];
  loading = false;
  submitting = false;

  // Estadísticas
  stats: CitasStats = { total: 0, programadas: 0, confirmadas: 0, atendidas: 0, canceladas: 0 };

  // Filtros
  searchTerm = '';
  filtroEstado = 'TODOS';
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  // Mensajes de notificación
  successMessage = '';
  errorMessage = '';

  // Modales
  showCreateModal = false;
  showEditModal = false;
  showDetailModal = false;
  showRescheduleModal = false;
  showCancelModal = false;

  // Cita seleccionada
  selectedCita: CitaResponse | null = null;

  // Formularios reactivos
  createForm!: FormGroup;
  editForm!: FormGroup;
  rescheduleForm!: FormGroup;
  cancelForm!: FormGroup;

  // Fecha y hora mínima (ahora)
  minDateTimeStr: string = this.calcularMinDateTime();

  ngOnInit(): void {
    this.initForms();
    this.cargarCitas();
    this.cargarEstadisticas();
    this.cargarCatalogos();
  }

  canManage(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('MEDICO');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  private initForms(): void {
    this.createForm = this.fb.group({
      idPaciente: [null, [Validators.required]],
      idMedico: [null],
      fechaHora: ['', [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      estado: ['PROGRAMADA', [Validators.required]],
      observaciones: ['']
    });

    this.editForm = this.fb.group({
      id: [null],
      idPaciente: [null, [Validators.required]],
      idMedico: [null],
      fechaHora: ['', [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      estado: ['PROGRAMADA', [Validators.required]],
      observaciones: ['']
    });

    this.rescheduleForm = this.fb.group({
      nuevaFechaHora: ['', [Validators.required]],
      motivoReprogramacion: ['', [Validators.maxLength(255)]]
    });

    this.cancelForm = this.fb.group({
      motivoCancelacion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]]
    });
  }

  calcularMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  cargarCitas(): void {
    this.loading = true;
    this.citasService.listarCitas(
      this.searchTerm,
      this.filtroEstado,
      undefined,
      undefined,
      this.filtroFechaDesde ? `${this.filtroFechaDesde}T00:00:00` : undefined,
      this.filtroFechaHasta ? `${this.filtroFechaHasta}T23:59:59` : undefined
    ).subscribe({
      next: (data) => {
        this.citas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.mostrarError(this.extraerError(err));
        this.cdr.detectChanges();
      }
    });
  }

  cargarEstadisticas(): void {
    this.citasService.obtenerEstadisticas().subscribe({
      next: (res) => { this.stats = res; }
    });
  }

  cargarCatalogos(): void {
    this.pacienteService.listarPacientes('', true).subscribe({
      next: (data) => { this.pacientesDisponibles = data; }
    });

    this.medicoService.listarMedicos('', 'TODAS', true).subscribe({
      next: (data) => {
        this.medicosDisponibles = data;
        // Si no es admin y es médico, asignar por defecto si hay coincidencia
        if (!this.isAdmin() && data.length > 0) {
          const username = this.authService.getUsername();
          const medicoPropio = data.find(m => m.username === username);
          if (medicoPropio) {
            this.createForm.patchValue({ idMedico: medicoPropio.idMedico });
          }
        }
      }
    });
  }

  onSearchChange(): void {
    this.cargarCitas();
  }

  onFiltroEstadoChange(estado: string): void {
    this.filtroEstado = estado;
    this.cargarCitas();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = 'TODOS';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.cargarCitas();
  }

  // ==========================================
  // REGISTRAR CITA
  // ==========================================
  abrirModalCrear(): void {
    this.limpiarMensajes();
    this.minDateTimeStr = this.calcularMinDateTime();

    let idMed = null;
    if (!this.isAdmin()) {
      const username = this.authService.getUsername();
      const propio = this.medicosDisponibles.find(m => m.username === username);
      if (propio) idMed = propio.idMedico;
    }

    this.createForm.reset({
      idPaciente: null,
      idMedico: idMed,
      fechaHora: '',
      motivo: '',
      estado: 'PROGRAMADA',
      observaciones: ''
    });

    this.showCreateModal = true;
  }

  cerrarModalCrear(): void {
    this.showCreateModal = false;
  }

  guardarCrear(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.limpiarMensajes();

    const val = this.createForm.value;
    const req: CitaRequest = {
      idPaciente: Number(val.idPaciente),
      idMedico: val.idMedico ? Number(val.idMedico) : undefined,
      fechaHora: val.fechaHora,
      motivo: val.motivo.trim(),
      estado: val.estado,
      observaciones: val.observaciones ? val.observaciones.trim() : undefined
    };

    this.citasService.registrarCita(req).subscribe({
      next: (nueva) => {
        this.submitting = false;
        this.showCreateModal = false;
        this.mostrarExito(`Cita médica #${nueva.idCita} registrada exitosamente.`);
        this.cargarCitas();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.submitting = false;
        this.mostrarError(this.extraerError(err));
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // EDITAR CITA
  // ==========================================
  abrirModalEditar(cita: CitaResponse): void {
    this.limpiarMensajes();
    this.selectedCita = cita;
    this.minDateTimeStr = this.calcularMinDateTime();

    // Formatear fecha para datetime-local (YYYY-MM-DDTHH:mm)
    const fechaHoraLocal = cita.fechaHora.slice(0, 16);

    this.editForm.patchValue({
      id: cita.idCita,
      idPaciente: cita.idPaciente,
      idMedico: cita.idMedico,
      fechaHora: fechaHoraLocal,
      motivo: cita.motivo,
      estado: cita.estado,
      observaciones: cita.observaciones || ''
    });

    this.showEditModal = true;
  }

  cerrarModalEditar(): void {
    this.showEditModal = false;
    this.selectedCita = null;
  }

  guardarEditar(): void {
    if (this.editForm.invalid || !this.selectedCita) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.limpiarMensajes();

    const val = this.editForm.value;
    const req: CitaRequest = {
      idPaciente: Number(val.idPaciente),
      idMedico: val.idMedico ? Number(val.idMedico) : undefined,
      fechaHora: val.fechaHora,
      motivo: val.motivo.trim(),
      estado: val.estado,
      observaciones: val.observaciones ? val.observaciones.trim() : undefined
    };

    this.citasService.actualizarCita(this.selectedCita.idCita, req).subscribe({
      next: (act) => {
        this.submitting = false;
        this.showEditModal = false;
        this.mostrarExito(`Cita médica #${act.idCita} actualizada con éxito.`);
        this.cargarCitas();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.submitting = false;
        this.mostrarError(this.extraerError(err));
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // REPROGRAMAR CITA
  // ==========================================
  abrirModalReprogramar(cita: CitaResponse): void {
    this.limpiarMensajes();
    this.selectedCita = cita;
    this.minDateTimeStr = this.calcularMinDateTime();

    this.rescheduleForm.reset({
      nuevaFechaHora: '',
      motivoReprogramacion: ''
    });

    this.showRescheduleModal = true;
  }

  cerrarModalReprogramar(): void {
    this.showRescheduleModal = false;
    this.selectedCita = null;
  }

  guardarReprogramar(): void {
    if (this.rescheduleForm.invalid || !this.selectedCita) {
      this.rescheduleForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.limpiarMensajes();

    const val = this.rescheduleForm.value;
    const req: CitaReprogramarRequest = {
      nuevaFechaHora: val.nuevaFechaHora,
      motivoReprogramacion: val.motivoReprogramacion ? val.motivoReprogramacion.trim() : undefined
    };

    this.citasService.reprogramarCita(this.selectedCita.idCita, req).subscribe({
      next: (act) => {
        this.submitting = false;
        this.showRescheduleModal = false;
        this.mostrarExito(`Cita #${act.idCita} reprogramada satisfactoriamente.`);
        this.cargarCitas();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.submitting = false;
        this.mostrarError(this.extraerError(err));
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // CANCELAR CITA
  // ==========================================
  abrirModalCancelar(cita: CitaResponse): void {
    this.limpiarMensajes();
    this.selectedCita = cita;
    this.cancelForm.reset({ motivoCancelacion: '' });
    this.showCancelModal = true;
  }

  cerrarModalCancelar(): void {
    this.showCancelModal = false;
    this.selectedCita = null;
  }

  guardarCancelar(): void {
    if (this.cancelForm.invalid || !this.selectedCita) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.limpiarMensajes();

    const motivo = this.cancelForm.value.motivoCancelacion.trim();

    this.citasService.cancelarCita(this.selectedCita.idCita, motivo).subscribe({
      next: (act) => {
        this.submitting = false;
        this.showCancelModal = false;
        this.mostrarExito(`La cita médica #${act.idCita} ha sido cancelada.`);
        this.cargarCitas();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.submitting = false;
        this.mostrarError(this.extraerError(err));
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // ATENDER CITA -> Redirigir a Consultas
  // ==========================================
  iniciarAtencion(cita: CitaResponse): void {
    this.router.navigate(['/consultas'], { queryParams: { idCita: cita.idCita } });
  }

  // ==========================================
  // VER DETALLE
  // ==========================================
  abrirModalDetalle(cita: CitaResponse): void {
    this.selectedCita = cita;
    this.showDetailModal = true;
  }

  cerrarModalDetalle(): void {
    this.showDetailModal = false;
    this.selectedCita = null;
  }

  // ==========================================
  // MENSAJES Y ERRORES
  // ==========================================
  mostrarExito(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 6000);
  }

  mostrarError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
  }

  limpiarMensajes(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private extraerError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err?.error === 'string') return err.error;
    if (err?.message) return err.message;
    return 'Ocurrió un error al procesar la solicitud.';
  }
}
