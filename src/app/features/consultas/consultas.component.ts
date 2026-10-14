import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideStethoscope,
  LucideCalendar,
  LucideSearch,
  LucidePlus,
  LucideEye,
  LucidePencil,
  LucideTrash2,
  LucideCheckCircle,
  LucideAlertTriangle,
  LucideRefreshCw,
  LucideLoaderCircle,
  LucideClipboardList,
  LucideFlaskConical,
  LucideFileText,
  LucideUser
} from '@lucide/angular';
import { ConsultasService } from '../../core/services/consultas.service';
import { CitasService } from '../../core/services/citas.service';
import { PacienteService } from '../../core/services/paciente.service';
import { MedicoService } from '../../core/services/medico.service';
import { AuthService } from '../../core/services/auth.service';
import { ConsultaResponse, ConsultaRequest, ConsultasStats } from '../../core/models/consultas.model';
import { CitaResponse } from '../../core/models/citas.model';
import { PacienteResponse } from '../../core/models/paciente.model';
import { MedicoResponse } from '../../core/models/medico.model';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideStethoscope,
    LucideCalendar,
    LucideSearch,
    LucidePlus,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideCheckCircle,
    LucideAlertTriangle,
    LucideRefreshCw,
    LucideLoaderCircle,
    LucideClipboardList,
    LucideFlaskConical,
    LucideFileText,
    LucideUser
  ],
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css']
})
export class ConsultasComponent implements OnInit {
  private readonly consultasService = inject(ConsultasService);
  private readonly citasService = inject(CitasService);
  private readonly pacienteService = inject(PacienteService);
  private readonly medicoService = inject(MedicoService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  // Listas de datos
  consultas: ConsultaResponse[] = [];
  citasDisponibles: CitaResponse[] = [];
  pacientesDisponibles: PacienteResponse[] = [];
  medicosDisponibles: MedicoResponse[] = [];

  loading = false;
  submitting = false;

  // Estadísticas
  stats: ConsultasStats = { total: 0 };

  // Filtros
  searchTerm = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  // Mensajes de notificación
  successMessage = '';
  errorMessage = '';

  // Modales
  showCreateModal = false;
  showEditModal = false;
  showDetailModal = false;
  showDeleteModal = false;

  // Registro seleccionado
  selectedConsulta: ConsultaResponse | null = null;

  // Formularios
  createForm!: FormGroup;
  editForm!: FormGroup;

  // Fecha y hora local actual formateada
  nowDateTimeStr: string = this.calcularNowDateTime();

  ngOnInit(): void {
    this.initForms();
    this.cargarConsultas();
    this.cargarEstadisticas();
    this.cargarCatalogos();

    // Comprobar si se abrió desde una cita médica (query param)
    this.route.queryParams.subscribe(params => {
      if (params['idCita']) {
        const idCitaNum = Number(params['idCita']);
        if (!isNaN(idCitaNum)) {
          this.abrirModalCrearConCita(idCitaNum);
        }
      }
    });
  }

  canManage(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('MEDICO');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  private initForms(): void {
    const now = this.calcularNowDateTime();

    this.createForm = this.fb.group({
      idCita: [null],
      idPaciente: [null],
      idMedico: [null],
      fechaConsulta: [now, [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(3)]],
      diagnostico: ['', [Validators.required, Validators.minLength(3)]],
      tratamiento: [''],
      observaciones: ['']
    });

    this.editForm = this.fb.group({
      id: [null],
      fechaConsulta: [now, [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(3)]],
      diagnostico: ['', [Validators.required, Validators.minLength(3)]],
      tratamiento: [''],
      observaciones: ['']
    });
  }

  calcularNowDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  cargarConsultas(): void {
    this.loading = true;
    this.consultasService.listarConsultas(
      this.searchTerm,
      undefined,
      undefined,
      this.filtroFechaDesde ? `${this.filtroFechaDesde}T00:00:00` : undefined,
      this.filtroFechaHasta ? `${this.filtroFechaHasta}T23:59:59` : undefined
    ).subscribe({
      next: (data) => {
        this.consultas = data;
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
    this.consultasService.obtenerEstadisticas().subscribe({
      next: (res) => { this.stats = res; }
    });
  }

  cargarCatalogos(): void {
    this.citasService.listarCitasDisponiblesConsulta().subscribe({
      next: (data) => { this.citasDisponibles = data; }
    });

    this.pacienteService.listarPacientes('', true).subscribe({
      next: (data) => { this.pacientesDisponibles = data; }
    });

    this.medicoService.listarMedicos('', 'TODAS', true).subscribe({
      next: (data) => {
        this.medicosDisponibles = data;
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
    this.cargarConsultas();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.cargarConsultas();
  }

  // Obtener cita seleccionada en el formulario
  obtenerCitaSeleccionada(idCita: number | null): CitaResponse | undefined {
    if (!idCita) return undefined;
    return this.citasDisponibles.find(c => c.idCita === Number(idCita));
  }

  // ==========================================
  // REGISTRAR CONSULTA
  // ==========================================
  abrirModalCrear(): void {
    this.limpiarMensajes();
    this.nowDateTimeStr = this.calcularNowDateTime();

    let idMed = null;
    if (!this.isAdmin()) {
      const username = this.authService.getUsername();
      const propio = this.medicosDisponibles.find(m => m.username === username);
      if (propio) idMed = propio.idMedico;
    }

    this.createForm.reset({
      idCita: null,
      idPaciente: null,
      idMedico: idMed,
      fechaConsulta: this.nowDateTimeStr,
      motivo: '',
      diagnostico: '',
      tratamiento: '',
      observaciones: ''
    });

    // Recargar citas disponibles por si se han actualizado
    this.citasService.listarCitasDisponiblesConsulta().subscribe({
      next: (data) => { this.citasDisponibles = data; }
    });

    this.showCreateModal = true;
  }

  abrirModalCrearConCita(idCita: number): void {
    this.citasService.obtenerCita(idCita).subscribe({
      next: (cita) => {
        this.abrirModalCrear();
        this.createForm.patchValue({
          idCita: cita.idCita,
          idPaciente: cita.idPaciente,
          idMedico: cita.idMedico,
          motivo: cita.motivo
        });
      },
      error: () => {
        this.abrirModalCrear();
      }
    });
  }

  onCitaChange(idCitaValue: any): void {
    if (idCitaValue) {
      const cita = this.obtenerCitaSeleccionada(Number(idCitaValue));
      if (cita) {
        this.createForm.patchValue({
          idPaciente: cita.idPaciente,
          idMedico: cita.idMedico,
          motivo: cita.motivo
        });
      }
    }
  }

  cerrarModalCrear(): void {
    this.showCreateModal = false;
  }

  guardarCrear(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const val = this.createForm.value;

    // Si no tiene cita, validar que idPaciente esté presente
    if (!val.idCita && !val.idPaciente) {
      this.mostrarError('Debe seleccionar un paciente si la consulta no proviene de una cita previa.');
      return;
    }

    this.submitting = true;
    this.limpiarMensajes();

    const req: ConsultaRequest = {
      idCita: val.idCita ? Number(val.idCita) : null,
      idPaciente: val.idPaciente ? Number(val.idPaciente) : null,
      idMedico: val.idMedico ? Number(val.idMedico) : null,
      fechaConsulta: val.fechaConsulta,
      motivo: val.motivo.trim(),
      diagnostico: val.diagnostico.trim(),
      tratamiento: val.tratamiento ? val.tratamiento.trim() : undefined,
      observaciones: val.observaciones ? val.observaciones.trim() : undefined
    };

    this.consultasService.registrarConsulta(req).subscribe({
      next: (nueva) => {
        this.submitting = false;
        this.showCreateModal = false;
        this.mostrarExito(`Consulta médica #${nueva.idConsulta} guardada con éxito.`);
        this.cargarConsultas();
        this.cargarEstadisticas();
        this.cargarCatalogos();
      },
      error: (err) => {
        this.submitting = false;
        this.mostrarError(this.extraerError(err));
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // EDITAR CONSULTA
  // ==========================================
  abrirModalEditar(consulta: ConsultaResponse): void {
    this.limpiarMensajes();
    this.selectedConsulta = consulta;

    const fechaLocal = consulta.fechaConsulta ? consulta.fechaConsulta.slice(0, 16) : this.calcularNowDateTime();

    this.editForm.patchValue({
      id: consulta.idConsulta,
      fechaConsulta: fechaLocal,
      motivo: consulta.motivo,
      diagnostico: consulta.diagnostico,
      tratamiento: consulta.tratamiento || '',
      observaciones: consulta.observaciones || ''
    });

    this.showEditModal = true;
  }

  cerrarModalEditar(): void {
    this.showEditModal = false;
    this.selectedConsulta = null;
  }

  guardarEditar(): void {
    if (this.editForm.invalid || !this.selectedConsulta) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.limpiarMensajes();

    const val = this.editForm.value;
    const req: ConsultaRequest = {
      fechaConsulta: val.fechaConsulta,
      motivo: val.motivo.trim(),
      diagnostico: val.diagnostico.trim(),
      tratamiento: val.tratamiento ? val.tratamiento.trim() : undefined,
      observaciones: val.observaciones ? val.observaciones.trim() : undefined
    };

    this.consultasService.actualizarConsulta(this.selectedConsulta.idConsulta, req).subscribe({
      next: (act) => {
        this.submitting = false;
        this.showEditModal = false;
        this.mostrarExito(`Consulta médica #${act.idConsulta} actualizada satisfactoriamente.`);
        this.cargarConsultas();
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
  // ELIMINAR CONSULTA
  // ==========================================
  abrirModalEliminar(consulta: ConsultaResponse): void {
    this.limpiarMensajes();
    this.selectedConsulta = consulta;
    this.showDeleteModal = true;
  }

  cerrarModalEliminar(): void {
    this.showDeleteModal = false;
    this.selectedConsulta = null;
  }

  confirmarEliminar(): void {
    if (!this.selectedConsulta) return;

    this.submitting = true;
    this.consultasService.eliminarConsulta(this.selectedConsulta.idConsulta).subscribe({
      next: (res) => {
        this.submitting = false;
        this.cerrarModalEliminar();
        this.mostrarExito(res.message || 'Consulta médica eliminada.');
        this.cargarConsultas();
        this.cargarEstadisticas();
        this.cargarCatalogos();
      },
      error: (err) => {
        this.submitting = false;
        this.cerrarModalEliminar();
        this.mostrarError(this.extraerError(err));
      }
    });
  }

  // ==========================================
  // VER DETALLE
  // ==========================================
  abrirModalDetalle(consulta: ConsultaResponse): void {
    this.consultasService.obtenerConsulta(consulta.idConsulta).subscribe({
      next: (detalle) => {
        this.selectedConsulta = detalle;
        this.showDetailModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostrarError(this.extraerError(err));
      }
    });
  }

  cerrarModalDetalle(): void {
    this.showDetailModal = false;
    this.selectedConsulta = null;
  }

  // ==========================================
  // INTEGRACIÓN CON FÓRMULAS MAGISTRALES
  // ==========================================
  irAFormulasMagistrales(idConsulta?: number): void {
    this.router.navigate(['/formulas-magistrales'], {
      queryParams: idConsulta ? { idConsulta } : {}
    });
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
