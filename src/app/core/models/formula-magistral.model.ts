export interface FormulaMagistralResponse {
  id: number;
  nombre: string;
  descripcion?: string;
  composicion: string;
  cantidad: number;
  unidad: string;
  fechaPreparacion: string;
  fechaVencimiento: string;
  estado: string;

  // Consulta médica asociada
  idConsulta?: number;
  fechaConsulta?: string;
  motivoConsulta?: string;
  diagnosticoConsulta?: string;

  // Paciente derivado
  idPaciente?: number;
  nombrePaciente?: string;
  dniPaciente?: string;

  // Médico responsable
  idMedico?: number;
  nombreMedico?: string;
  especialidadMedico?: string;
  colegiaturaMedico?: string;
}

export interface FormulaMagistralRequest {
  nombre: string;
  descripcion?: string;
  composicion: string;
  cantidad: number;
  unidad: string;
  fechaPreparacion: string;
  fechaVencimiento: string;
  estado: string;
  idConsulta?: number | null;
}

export interface ConsultaResumen {
  idConsulta: number;
  fechaConsulta: string;
  motivo: string;
  diagnostico: string;
  idPaciente?: number;
  nombrePaciente?: string;
  dniPaciente?: string;
  idMedico?: number;
  nombreMedico?: string;
  especialidadMedico?: string;
}

export interface IngredienteItem {
  nombre: string;
  cantidad: number;
  unidad: string;
  observaciones?: string;
}
