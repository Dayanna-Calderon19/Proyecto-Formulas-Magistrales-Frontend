export interface UsuarioResponse {
  idUsuario: number;
  username: string;
  nombreCompleto?: string;
  correo: string;
  activo: boolean;
  fechaCreacion: string;
  roles: string[];
  idMedico?: number;
  nombreMedico?: string;
}

export interface UsuarioCreateRequest {
  username: string;
  nombreCompleto?: string;
  correo: string;
  password: string;
  roles: string[];
  activo: boolean;
}

export interface UsuarioUpdateRequest {
  username: string;
  nombreCompleto?: string;
  correo: string;
  roles: string[];
  activo: boolean;
}

export interface PasswordResetRequest {
  password: string;
}
