export interface FormulaResumen {
  idFormula: number;
  nombre: string;
  composicion: string;
  cantidad: number;
  unidad: string;
  estado: string;
}

export interface ConsultaResponse {
  idConsulta: number;
  fechaConsulta: string;
  motivo: string;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;

  // Cita asociada
  idCita?: number;
  fechaHoraCita?: string;

  // Paciente
  idPaciente: number;
  nombrePaciente: string;
  dniPaciente: string;
  telefonoPaciente?: string;
  correoPaciente?: string;

  // Médico
  idMedico: number;
  nombreMedico: string;
  especialidadMedico: string;
  colegiaturaMedico: string;

  // Fórmulas magistrales
  totalFormulas: number;
  formulas: FormulaResumen[];
}

export interface ConsultaRequest {
  idCita?: number | null;
  idPaciente?: number | null;
  idMedico?: number | null;
  fechaConsulta?: string;
  motivo: string;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
}

export interface ConsultasStats {
  total: number;
}
