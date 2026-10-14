export interface CitaResponse {
  idCita: number;
  fechaHora: string;
  motivo: string;
  estado: 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | string;
  observaciones?: string;

  // Paciente
  idPaciente: number;
  nombrePaciente: string;
  dniPaciente: string;
  telefonoPaciente?: string;

  // Médico
  idMedico: number;
  nombreMedico: string;
  especialidadMedico: string;
  colegiaturaMedico: string;

  // Consulta asociada si ya fue atendida
  idConsulta?: number;
}

export interface CitaRequest {
  idPaciente: number;
  idMedico?: number;
  fechaHora: string;
  motivo: string;
  estado?: string;
  observaciones?: string;
}

export interface CitaReprogramarRequest {
  nuevaFechaHora: string;
  motivoReprogramacion?: string;
}

export interface CitasStats {
  total: number;
  programadas: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
}
