import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  LucideFlaskConical,
  LucidePlus,
  LucideSearch,
  LucideEye,
  LucidePencil,
  LucideTrash2,
  LucideCheckCircle,
  LucideBan,
  LucideAlertTriangle,
  LucideRefreshCw,
  LucideCalendar,
  LucideLoaderCircle,
  LucideStethoscope,
  LucidePill,
  LucideClipboardList
} from '@lucide/angular';
import { FormulaMagistralService } from '../../core/services/formula-magistral.service';
import { AuthService } from '../../core/services/auth.service';
import {
  FormulaMagistralResponse,
  FormulaMagistralRequest,
  ConsultaResumen,
  IngredienteItem
} from '../../core/models/formula-magistral.model';

@Component({
  selector: 'app-formulas-magistrales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideFlaskConical,
    LucidePlus,
    LucideSearch,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideCheckCircle,
    LucideBan,
    LucideAlertTriangle,
    LucideRefreshCw,
    LucideCalendar,
    LucideLoaderCircle,
    LucideStethoscope,
    LucidePill,
    LucideClipboardList
  ],
  templateUrl: './formulas-magistrales.component.html',
  styleUrls: ['./formulas-magistrales.component.css']
})
export class FormulasMagistralesComponent implements OnInit {
  private readonly formulaService = inject(FormulaMagistralService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  // Datos
  formulas: FormulaMagistralResponse[] = [];
  consultasDisponibles: ConsultaResumen[] = [];
  loading = false;
  submitting = false;
  loadingConsultas = false;

  // Estadísticas
  totalFormulas = 0;
  totalActivas = 0;

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
  showStatusModal = false;
  showDeleteModal = false;

  // Registros seleccionados
  selectedFormula: FormulaMagistralResponse | null = null;
  statusTargetFormula: FormulaMagistralResponse | null = null;
  statusTargetNuevoEstado = '';
  formulaAEliminar: FormulaMagistralResponse | null = null;

  // Formularios
  createForm!: FormGroup;
  editForm!: FormGroup;

  // Lista de unidades de medida comunes en formulación magistral
  unidadesMedida: string[] = [
    'ml',
    'g',
    'mg',
    'gotas',
    'cápsulas',
    'comprimidos',
    'frasco',
    'tubo',
    'pomada',
    'solución',
    'suspensión',
    'óvulos',
    'sobres',
    'unidades'
  ];

  // Estados posibles para fórmulas
  estadosFormula: string[] = [
    'ACTIVO',
    'EN_PREPARACION',
    'DISPENSADA',
    'INACTIVO',
    'ANULADA'
  ];

  // Fecha de hoy para validaciones
  todayDateStr: string = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.initForms();
    this.cargarFormulas();
    this.cargarConsultasDisponibles();
    this.cargarEstadisticas();
  }

  canManage(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('MEDICO');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  // ==========================================
  // INICIALIZACIÓN DE FORMULARIOS REACTIVOS
  // ==========================================
  private initForms(): void {
    const today = new Date().toISOString().split('T')[0];
    const inOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.createForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      descripcion: ['', [Validators.maxLength(255)]],
      composicion: ['', [Validators.required, Validators.maxLength(255)]],
      cantidad: [1, [Validators.required, Validators.min(1.00)]],
      unidad: ['ml', [Validators.required, Validators.maxLength(30)]],
      fechaPreparacion: [today, [Validators.required]],
      fechaVencimiento: [inOneMonth, [Validators.required]],
      estado: ['ACTIVO', [Validators.required, Validators.maxLength(25)]],
      idConsulta: [null],
      // Lista dinámica de ingredientes para composición estructurada
      ingredientes: this.fb.array([])
    }, { validators: this.validarRangoFechas });

    this.editForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      descripcion: ['', [Validators.maxLength(255)]],
      composicion: ['', [Validators.required, Validators.maxLength(255)]],
      cantidad: [1, [Validators.required, Validators.min(1.00)]],
      unidad: ['ml', [Validators.required, Validators.maxLength(30)]],
      fechaPreparacion: ['', [Validators.required]],
      fechaVencimiento: ['', [Validators.required]],
      estado: ['ACTIVO', [Validators.required, Validators.maxLength(25)]],
      idConsulta: [null],
      ingredientes: this.fb.array([])
    }, { validators: this.validarRangoFechas });
  }

  // Validador personalizado de fechas
  private validarRangoFechas(group: AbstractControl): ValidationErrors | null {
    const prep = group.get('fechaPreparacion')?.value;
    const venc = group.get('fechaVencimiento')?.value;
    if (prep && venc && new Date(venc) < new Date(prep)) {
      return { fechaVencimientoInvalida: true };
    }
    return null;
  }

  // Getters para ingredientes dinámicos
  get createIngredientes(): FormArray {
    return this.createForm.get('ingredientes') as FormArray;
  }

  get editIngredientes(): FormArray {
    return this.editForm.get('ingredientes') as FormArray;
  }

  crearIngredienteGroup(nombre = '', cantidad = 1, unidad = 'g', observaciones = ''): FormGroup {
    return this.fb.group({
      nombre: [nombre, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      cantidad: [cantidad, [Validators.required, Validators.min(0.01)]],
      unidad: [unidad, [Validators.required, Validators.maxLength(20)]],
      observaciones: [observaciones, [Validators.maxLength(50)]]
    });
  }

  agregarIngrediente(esEdicion = false): void {
    const array = esEdicion ? this.editIngredientes : this.createIngredientes;
    array.push(this.crearIngredienteGroup());
    this.sincronizarComposicionDesdeIngredientes(esEdicion);
  }

  removerIngrediente(index: number, esEdicion = false): void {
    const array = esEdicion ? this.editIngredientes : this.createIngredientes;
    array.removeAt(index);
    this.sincronizarComposicionDesdeIngredientes(esEdicion);
  }

  sincronizarComposicionDesdeIngredientes(esEdicion = false): void {
    const form = esEdicion ? this.editForm : this.createForm;
    const array = esEdicion ? this.editIngredientes : this.createIngredientes;

    if (array.length === 0) return;

    const items = array.value as IngredienteItem[];
    const textos = items
      .filter(item => item.nombre && item.nombre.trim())
      .map(item => `${item.nombre.trim()} ${item.cantidad} ${item.unidad}`);

    if (textos.length > 0) {
      let textoComposicion = textos.join(', ');
      if (textoComposicion.length > 255) {
        textoComposicion = textoComposicion.substring(0, 255);
      }
      form.patchValue({ composicion: textoComposicion });
    }
  }

  // ==========================================
  // CARGA DE DATOS Y FILTROS
  // ==========================================
  cargarFormulas(): void {
    this.loading = true;
    this.formulaService.listarFormulas(this.searchTerm, this.filtroEstado).subscribe({
      next: (data) => {
        let filtradas = data;

        // Filtro local opcional por fechas si se especificaron
        if (this.filtroFechaDesde) {
          filtradas = filtradas.filter(f => f.fechaPreparacion >= this.filtroFechaDesde);
        }
        if (this.filtroFechaHasta) {
          filtradas = filtradas.filter(f => f.fechaPreparacion <= this.filtroFechaHasta);
        }

        this.formulas = filtradas;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.mostrarError('Error al cargar las fórmulas magistrales: ' + this.extraerMensajeError(err));
        this.cdr.detectChanges();
      }
    });
  }

  cargarConsultasDisponibles(): void {
    this.loadingConsultas = true;
    this.formulaService.listarConsultasDisponibles().subscribe({
      next: (data) => {
        this.consultasDisponibles = data;
        this.loadingConsultas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingConsultas = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.formulaService.obtenerTotal().subscribe({
      next: (res) => { this.totalFormulas = res.total; }
    });
    this.formulaService.obtenerTotalActivas().subscribe({
      next: (res) => { this.totalActivas = res.totalActivas; }
    });
  }

  onSearchChange(): void {
    this.cargarFormulas();
  }

  onFiltroEstadoChange(estado: string): void {
    this.filtroEstado = estado;
    this.cargarFormulas();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = 'TODOS';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.cargarFormulas();
  }

  // ==========================================
  // CONSULTA ASOCIADA Y DATOS DERIVADOS
  // ==========================================
  obtenerConsultaSeleccionada(idConsulta: number | null): ConsultaResumen | undefined {
    if (!idConsulta) return undefined;
    return this.consultasDisponibles.find(c => c.idConsulta === Number(idConsulta));
  }

  // ==========================================
  // MODAL REGISTRO
  // ==========================================
  abrirModalCrear(): void {
    this.limpiarMensajes();
    const today = new Date().toISOString().split('T')[0];
    const inOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.createForm.reset({
      nombre: '',
      descripcion: '',
      composicion: '',
      cantidad: 1,
      unidad: 'ml',
      fechaPreparacion: today,
      fechaVencimiento: inOneMonth,
      estado: 'ACTIVO',
      idConsulta: null
    });

    this.createIngredientes.clear();
    // Añadir un ingrediente por defecto para guiar al usuario
    this.agregarIngrediente(false);

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

    const formVal = this.createForm.value;
    const payload: FormulaMagistralRequest = {
      nombre: formVal.nombre.trim(),
      descripcion: formVal.descripcion ? formVal.descripcion.trim() : '',
      composicion: formVal.composicion.trim(),
      cantidad: Number(formVal.cantidad),
      unidad: formVal.unidad.trim(),
      fechaPreparacion: formVal.fechaPreparacion,
      fechaVencimiento: formVal.fechaVencimiento,
      estado: formVal.estado || 'ACTIVO',
      idConsulta: formVal.idConsulta ? Number(formVal.idConsulta) : null
    };

    this.formulaService.registrarFormula(payload).subscribe({
      next: (nueva) => {
        this.submitting = false;
        this.showCreateModal = false;
        this.mostrarExito(`Fórmula magistral "${nueva.nombre}" registrada correctamente.`);
        this.cargarFormulas();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.submitting = false;
        this.mostrarError(this.extraerMensajeError(err));
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // MODAL DETALLE
  // ==========================================
  abrirModalDetalle(formula: FormulaMagistralResponse): void {
    this.selectedFormula = formula;
    this.showDetailModal = true;
  }

  cerrarModalDetalle(): void {
    this.showDetailModal = false;
    this.selectedFormula = null;
  }

  // ==========================================
  // MODAL EDICIÓN
  // ==========================================
  abrirModalEditar(formula: FormulaMagistralResponse): void {
    this.limpiarMensajes();
    this.selectedFormula = formula;

    this.editForm.patchValue({
      id: formula.id,
      nombre: formula.nombre,
      descripcion: formula.descripcion || '',
      composicion: formula.composicion,
      cantidad: formula.cantidad,
      unidad: formula.unidad,
      fechaPreparacion: formula.fechaPreparacion,
      fechaVencimiento: formula.fechaVencimiento,
      estado: formula.estado,
      idConsulta: formula.idConsulta || null
    });

    this.editIngredientes.clear();
    // Parsear composición simple si contiene comas
    if (formula.composicion) {
      const partes = formula.composicion.split(',');
      for (const p of partes) {
        const item = p.trim();
        if (item) {
          this.editIngredientes.push(this.crearIngredienteGroup(item, 1, formula.unidad || 'g'));
        }
      }
    }

    this.showEditModal = true;
  }

  cerrarModalEditar(): void {
    this.showEditModal = false;
    this.selectedFormula = null;
  }

  guardarEditar(): void {
    if (this.editForm.invalid || !this.selectedFormula) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.limpiarMensajes();

    const formVal = this.editForm.value;
    const payload: FormulaMagistralRequest = {
      nombre: formVal.nombre.trim(),
      descripcion: formVal.descripcion ? formVal.descripcion.trim() : '',
      composicion: formVal.composicion.trim(),
      cantidad: Number(formVal.cantidad),
      unidad: formVal.unidad.trim(),
      fechaPreparacion: formVal.fechaPreparacion,
      fechaVencimiento: formVal.fechaVencimiento,
      estado: formVal.estado,
      idConsulta: formVal.idConsulta ? Number(formVal.idConsulta) : null
    };

    this.formulaService.actualizarFormula(this.selectedFormula.id, payload).subscribe({
      next: (actualizada) => {
        this.submitting = false;
        this.showEditModal = false;
        this.mostrarExito(`Fórmula "${actualizada.nombre}" actualizada con éxito.`);
        this.cargarFormulas();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.submitting = false;
        this.mostrarError(this.extraerMensajeError(err));
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // CAMBIO DE ESTADO / DESACTIVACIÓN
  // ==========================================
  abrirModalEstado(formula: FormulaMagistralResponse, nuevoEstado: string): void {
    this.statusTargetFormula = formula;
    this.statusTargetNuevoEstado = nuevoEstado;
    this.showStatusModal = true;
  }

  cerrarModalEstado(): void {
    this.showStatusModal = false;
    this.statusTargetFormula = null;
    this.statusTargetNuevoEstado = '';
  }

  confirmarCambioEstado(): void {
    if (!this.statusTargetFormula || !this.statusTargetNuevoEstado) return;

    this.submitting = true;
    this.formulaService.cambiarEstado(this.statusTargetFormula.id, this.statusTargetNuevoEstado).subscribe({
      next: (act) => {
        this.submitting = false;
        this.cerrarModalEstado();
        this.mostrarExito(`Estado de la fórmula "${act.nombre}" actualizado a ${act.estado}.`);
        this.cargarFormulas();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.submitting = false;
        this.cerrarModalEstado();
        this.mostrarError(this.extraerMensajeError(err));
      }
    });
  }

  // ==========================================
  // ELIMINACIÓN / ANULACIÓN FORMAL (DELETE)
  // ==========================================
  abrirModalEliminar(formula: FormulaMagistralResponse): void {
    this.formulaAEliminar = formula;
    this.showDeleteModal = true;
  }

  cerrarModalEliminar(): void {
    this.showDeleteModal = false;
    this.formulaAEliminar = null;
  }

  confirmarEliminarFormula(): void {
    if (!this.formulaAEliminar) return;

    this.submitting = true;
    const f = this.formulaAEliminar;
    this.formulaService.desactivarFormula(f.id).subscribe({
      next: (res) => {
        this.submitting = false;
        this.cerrarModalEliminar();
        this.mostrarExito(res.message || `Fórmula "${f.nombre}" anulada exitosamente.`);
        this.cargarFormulas();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.submitting = false;
        this.cerrarModalEliminar();
        this.mostrarError(this.extraerMensajeError(err));
      }
    });
  }

  // ==========================================
  // UTILIDADES Y MENSAJES
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

  private extraerMensajeError(err: any): string {
    if (err?.error?.message) {
      return err.error.message;
    }
    if (typeof err?.error === 'string') {
      return err.error;
    }
    if (err?.message) {
      return err.message;
    }
    return 'Ocurrió un error inesperado al procesar la solicitud.';
  }

  // Verificación de vencimiento
  estaVencida(fechaVencimiento: string): boolean {
    if (!fechaVencimiento) return false;
    const hoy = new Date().toISOString().split('T')[0];
    return fechaVencimiento < hoy;
  }

  proximaAVencer(fechaVencimiento: string): boolean {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const venc = new Date(fechaVencimiento);
    const diffDias = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
    return diffDias >= 0 && diffDias <= 7;
  }
}
