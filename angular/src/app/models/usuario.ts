export interface Usuario {
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  rol: 'voluntario' | 'investigador';
  estado: 'ACTIVO' | 'INACTIVO';
  credencialVerificada: boolean;
  onboardingCompletado: boolean;
  creadoEn: string;
  telefono?: string;
  institucion?: string;
  bio?: string;
  especialidad?: string;
}
