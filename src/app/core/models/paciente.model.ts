export interface PacienteResponse {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  sexo?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  estado: boolean;
  totalConsultas?: number;
}

export interface PacienteRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  fechaNacimiento: string;
  sexo?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  estado?: boolean;
}

export interface ConsultaHistorial {
  idConsulta: number;
  fechaConsulta: string;
  motivo: string;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
  idPaciente: number;
  nombrePaciente: string;
  dniPaciente: string;
  idMedico: number;
  nombreMedico: string;
  especialidadMedico: string;
  colegiaturaMedico: string;
}
