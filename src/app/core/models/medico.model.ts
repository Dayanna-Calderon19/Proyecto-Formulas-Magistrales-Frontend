export interface MedicoResponse {
  idMedico: number;
  nombres: string;
  apellidos: string;
  dni: string;
  colegiatura: string;
  especialidad: string;
  telefono?: string;
  correo?: string;
  estado: boolean;
  idUsuario?: number;
  username?: string;
  nombreCompletoUsuario?: string;
  usuarioActivo?: boolean;
  totalConsultas?: number;
}

export interface MedicoRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  colegiatura: string;
  especialidad: string;
  telefono?: string;
  correo?: string;
  estado?: boolean;
  idUsuario?: number | null;
}
