/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'VIAJERO' | 'INSPECTOR_SAG' | 'FUNCIONARIO_ADUANA' | 'OFICIAL_PDI' | 'ADMIN';

export interface Usuario {
  id: string;
  rut: string; // Chilean National ID (e.g., 12.345.678-9)
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  nacionalidad: string;
  rol: UserRole;
  fechaRegistro: string;
}

export interface Vehiculo {
  id: string;
  patente: string; // License plate
  marca: string;
  modelo: string;
  propietarioRut: string;
  paisRegistro: string; // 'CHILE', 'ARGENTINA', etc.
  anio: number;
  tipoVehiculo: 'PARTICULAR' | 'COMERCIAL' | 'BUS' | 'MOTO';
  numeroChasis?: string;
  estado: 'AUTORIZADO' | 'PENDIENTE' | 'RECHAZADO';
}

export interface Documento {
  id: string;
  tipo: 'DECLARACION_SAG' | 'FORMULARIO_ADUANA' | 'PERMISO_PDI' | 'SOAPEX';
  titulo: string;
  viajeroRut: string;
  viajeroNombre: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaCreacion: string;
  fechaValidacion?: string;
  validadoPor?: string; // ID of the officer
  archivoNombre: string;
  datosContenido: {
    traeAlimentos: boolean;
    traeProductosVegetales: boolean;
    traeProductosAnimales: boolean;
    montoDivisas?: number;
    descripcionEquipaje?: string;
    [key: string]: any;
  };
  observaciones?: string;
}

export interface BorderStat {
  pasoNombre: string;
  tiempoEsperaSinSgf: number; // in hours
  tiempoEsperaConSgf: number; // in minutes
  vehiculosProcesados: number;
  alertasDetectadas: number;
}

export interface ReporteEstadistico {
  fechaGeneracion: string;
  rangoFechas: string;
  totalViajeros: number;
  totalVehiculos: number;
  totalDocumentosAprobados: number;
  totalDocumentosRechazados: number;
  tiempoEsperaPromedioAntes: number; // hours
  tiempoEsperaPromedioAhora: number; // minutes
  desglosePasos: BorderStat[];
}
