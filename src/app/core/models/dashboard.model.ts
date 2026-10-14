export interface DashboardKpi {
  id: string;
  titulo: string;
  valor: number;
  subtitulo: string;
  icono: string;
  ruta: string;
  variacion?: string;
  color: 'primary' | 'secondary' | 'info' | 'warning' | 'success';
}

export interface DashboardEstadoCount {
  estado: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface DashboardSeriePunto {
  etiqueta: string;
  fecha: string;
  citas: number;
  consultas: number;
  formulas: number;
}

export interface DashboardProximaCita {
  idCita: number;
  fechaHora: string;
  idPaciente: number;
  nombrePaciente: string;
  dniPaciente: string;
  idMedico: number;
  nombreMedico: string;
  especialidadMedico?: string;
  motivo: string;
  estado: string;
}

export interface DashboardMedicoInfo {
  idMedico: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  especialidad: string;
  colegiatura: string;
}

export interface DashboardResumen {
  rol: 'ADMIN' | 'MEDICO';
  username: string;
  nombreUsuario: string;
  tienePerfilMedico: boolean;
  medicoInfo?: DashboardMedicoInfo;
  periodo: string;
  fechaDesde: string;
  fechaHasta: string;

  kpis: DashboardKpi[];
  citasPorEstado: DashboardEstadoCount[];
  tendenciaPeriodo: DashboardSeriePunto[];
  formulasPorEstado: DashboardEstadoCount[];
  proximasCitas: DashboardProximaCita[];
}

export type PeriodoTipo = 'HOY' | '7_DIAS' | '30_DIAS' | 'MES_ACTUAL' | 'PERSONALIZADO';
