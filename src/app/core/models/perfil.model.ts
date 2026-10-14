export interface PerfilResponse {
  idUsuario: number;
  username: string;
  nombreCompleto?: string;
  correo: string;
  activo: boolean;
  fechaCreacion: string;
  roles: string[];
  idMedico?: number;
  nombreMedico?: string;
  dniMedico?: string;
  especialidad?: string;
  colegiatura?: string;
  telefonoMedico?: string;
  correoMedico?: string;
  estadoMedico?: boolean;
}

export interface CambioPasswordPropioRequest {
  passwordActual: string;
  passwordNuevo: string;
}
