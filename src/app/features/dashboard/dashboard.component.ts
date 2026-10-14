import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideUsers,
  LucideStethoscope,
  LucideCalendar,
  LucideClipboardList,
  LucideFlaskConical,
  LucideUserCog,
  LucideShield,
  LucideChevronRight,
  LucideRefreshCw,
  LucideAlertTriangle,
  LucideClock,
  LucideCalendarCheck,
  LucideCalendarClock
} from '@lucide/angular';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import {
  DashboardResumen,
  PeriodoTipo
} from '../../core/models/dashboard.model';


interface SegmentoDonut {
  color: string;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideUsers,

    LucideStethoscope,
    LucideCalendar,
    LucideClipboardList,
    LucideFlaskConical,
    LucideUserCog,
    LucideShield,
    LucideChevronRight,
    LucideRefreshCw,
    LucideAlertTriangle,
    LucideClock,
    LucideCalendarCheck,
    LucideCalendarClock
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  resumen: DashboardResumen | null = null;
  cargando: boolean = false;
  errorMensaje: string | null = null;

  periodoSeleccionado: PeriodoTipo = '30_DIAS';
  fechaDesdePersonalizada: string = '';
  fechaHastaPersonalizada: string = '';
  fechaHoyStr: string = '';
  fechaHoyFormateada: string = '';
  saludoHora: string = 'Buen día';

  ngOnInit(): void {

    this.inicializarFechasYSeguridad();
    this.cargarDashboard();
  }

  private inicializarFechasYSeguridad(): void {
    const hoy = new Date();
    this.fechaHoyStr = hoy.toISOString().split('T')[0];

    // Saludo según la hora del día
    const hora = hoy.getHours();
    if (hora >= 5 && hora < 12) {
      this.saludoHora = 'Buenos días';
    } else if (hora >= 12 && hora < 19) {
      this.saludoHora = 'Buenas tardes';
    } else {
      this.saludoHora = 'Buenas noches';
    }

    // Fecha en español legible
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const formateada = hoy.toLocaleDateString('es-ES', opciones);
    this.fechaHoyFormateada = formateada.charAt(0).toUpperCase() + formateada.slice(1);

    // Fechas por defecto para rango personalizado
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 29);
    this.fechaDesdePersonalizada = hace30Dias.toISOString().split('T')[0];
    this.fechaHastaPersonalizada = this.fechaHoyStr;
  }

  get esAdmin(): boolean {
    if (this.resumen?.rol) {
      return this.resumen.rol === 'ADMIN';
    }
    return this.authService.hasRole('ADMIN');
  }

  get nombreUsuarioMostrado(): string {
    if (this.resumen?.medicoInfo?.nombreCompleto) {
      return `Dr. ${this.resumen.medicoInfo.nombreCompleto}`;
    }
    if (this.resumen?.nombreUsuario) {
      return this.resumen.nombreUsuario;
    }
    return this.authService.getUsername() || 'Usuario';
  }

  get totalCitasPeriodo(): number {
    if (!this.resumen?.citasPorEstado) return 0;
    return this.resumen.citasPorEstado.reduce((acc, curr) => acc + curr.cantidad, 0);
  }

  get segmentosDonut(): SegmentoDonut[] {

    if (!this.resumen?.citasPorEstado || this.totalCitasPeriodo === 0) return [];
    const circunferencia = 2 * Math.PI * 60; // r=60 -> ~376.99
    let offsetAcumulado = 0;

    return this.resumen.citasPorEstado
      .filter(item => item.cantidad > 0)
      .map(item => {
        const fraccion = item.cantidad / this.totalCitasPeriodo;
        const longitud = fraccion * circunferencia;
        const dashArray = `${longitud} ${circunferencia - longitud}`;
        const dashOffset = -offsetAcumulado;
        offsetAcumulado += longitud;

        return {
          color: item.color,
          dashArray,
          dashOffset
        };
      });
  }

  cargarDashboard(): void {
    this.cargando = true;
    this.errorMensaje = null;

    let desde: string | undefined = undefined;
    let hasta: string | undefined = undefined;

    if (this.periodoSeleccionado === 'PERSONALIZADO') {
      desde = this.fechaDesdePersonalizada;
      hasta = this.fechaHastaPersonalizada;
    }

    this.dashboardService.obtenerResumen(this.periodoSeleccionado, desde, hasta).subscribe({
      next: (data) => {
        this.resumen = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard', err);
        this.errorMensaje = 'Ocurrió un problema de comunicación con el servidor. Verifica tu conexión o intenta nuevamente.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  cambiarPeriodo(periodo: PeriodoTipo): void {
    this.periodoSeleccionado = periodo;
    if (periodo !== 'PERSONALIZADO') {
      this.cargarDashboard();
    }
  }

  aplicarFiltroPersonalizado(): void {
    if (!this.fechaDesdePersonalizada || !this.fechaHastaPersonalizada) return;
    if (this.fechaDesdePersonalizada > this.fechaHastaPersonalizada) {
      this.errorMensaje = 'La fecha de inicio no puede ser posterior a la fecha de fin.';
      return;
    }
    this.cargarDashboard();
  }

  obtenerNombreIcono(icono: string): string {
    switch (icono) {
      case 'users': return 'users';
      case 'stethoscope': return 'stethoscope';
      case 'calendar': return 'calendar';
      case 'clock': return 'clock';
      case 'activity': return 'clipboard-list';
      case 'flask-conical': return 'flask-conical';
      case 'shield-check': return 'shield';
      case 'calendar-check': return 'calendar-check';
      default: return 'calendar';
    }
  }

  formatearFechaHora(iso: string): string {

    if (!iso) return '-';
    try {
      const d = new Date(iso);
      const opcionesFecha: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      const opcionesHora: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return `${d.toLocaleDateString('es-ES', opcionesFecha)} - ${d.toLocaleTimeString('es-ES', opcionesHora)}`;
    } catch {
      return iso;
    }
  }

  formatearFechaCorta(iso: string): string {
    if (!iso) return '-';
    try {
      const parts = iso.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return iso;
    } catch {
      return iso;
    }
  }

  formatearNombreEstado(estado: string): string {
    if (!estado) return '';
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  }
}
