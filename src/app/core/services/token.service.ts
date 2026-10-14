export interface JwtPayload {
  sub?: string;
  username?: string;
  roles?: string[] | string;
  authorities?: string[] | string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export class TokenService {
  private static readonly storageKey = 'auth_token';

  static getToken(): string | null {
    return localStorage.getItem(TokenService.storageKey);
  }

  static setToken(token: string): void {
    localStorage.setItem(TokenService.storageKey, token);
  }

  static removeToken(): void {
    localStorage.removeItem(TokenService.storageKey);
  }

  static getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      const raw = atob(base64);
      try {
        const jsonPayload = decodeURIComponent(
          raw
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload) as JwtPayload;
      } catch {
        return JSON.parse(raw) as JwtPayload;
      }
    } catch {
      return null;
    }
  }

  static getUsername(): string | null {
    const payload = this.getPayload();
    if (!payload) return null;
    return payload.sub || payload.username || null;
  }

  static getRoles(): string[] {
    const payload = this.getPayload();
    if (!payload) return [];
    const rawRoles = payload.roles || payload.authorities;
    if (Array.isArray(rawRoles)) {
      return rawRoles.map(r => String(r).toUpperCase());
    }
    if (typeof rawRoles === 'string') {
      return [rawRoles.toUpperCase()];
    }
    return [];
  }

  static isTokenExpired(): boolean {
    const payload = this.getPayload();
    if (!payload || !payload.exp) {
      return false;
    }
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return nowInSeconds >= payload.exp;
  }

  static isValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired();
  }
}




