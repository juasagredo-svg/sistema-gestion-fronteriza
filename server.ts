/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Usuario, Vehiculo, Documento, ReporteEstadistico, UserRole } from './src/types';

// Seed initial database state in memory so CRUD actions persist during the session
let DB_USUARIOS: Usuario[] = [
  {
    id: "1",
    rut: "12.345.678-9",
    nombre: "Esteban",
    apellido: "González",
    email: "esteban.viajero@gmail.com",
    telefono: "+56987654321",
    nacionalidad: "CHILENA",
    rol: "VIAJERO",
    fechaRegistro: "2026-06-10T14:30:00Z",
    identificacionValida: true,
    motivoIdInvalida: "OK",
    ordenArresto: false,
    estadoIngreso: "PENDIENTE"
  },
  {
    id: "2",
    rut: "11.111.111-1",
    nombre: "Juan",
    apellido: "Valdés",
    email: "juan.sag@sgf.gob.cl",
    telefono: "+56911223344",
    nacionalidad: "CHILENA",
    rol: "INSPECTOR_SAG",
    fechaRegistro: "2026-01-15T09:00:00Z"
  },
  {
    id: "3",
    rut: "22.222.222-2",
    nombre: "María",
    apellido: "Lorca",
    email: "maria.aduanas@sgf.gob.cl",
    telefono: "+56922334455",
    nacionalidad: "CHILENA",
    rol: "FUNCIONARIO_ADUANA",
    fechaRegistro: "2026-01-16T10:15:00Z"
  },
  {
    id: "4",
    rut: "33.333.333-3",
    nombre: "Carlos",
    apellido: "Pinto",
    email: "carlos.pdi@sgf.gob.cl",
    telefono: "+56933445566",
    nacionalidad: "CHILENA",
    rol: "OFICIAL_PDI",
    fechaRegistro: "2026-01-20T08:30:00Z"
  },
  {
    id: "5",
    rut: "44.444.444-4",
    nombre: "Administrador",
    apellido: "General",
    email: "admin@sgf.gob.cl",
    telefono: "+562223344",
    nacionalidad: "CHILENA",
    rol: "ADMIN",
    fechaRegistro: "2026-01-01T00:00:00Z"
  },
  {
    id: "6",
    rut: "95.421.350-K",
    nombre: "Mateo",
    apellido: "Fernández",
    email: "mateo.viajero@hotmail.com",
    telefono: "+549341555566",
    nacionalidad: "ARGENTINA",
    rol: "TURISTA",
    fechaRegistro: "2026-06-25T18:20:00Z",
    identificacionValida: true,
    motivoIdInvalida: "OK",
    ordenArresto: false,
    estadoIngreso: "PENDIENTE"
  },
  {
    id: "7",
    rut: "8.888.888-8",
    nombre: "Sven",
    apellido: "Lindqvist",
    email: "sven.turista@gmail.com",
    telefono: "+461234567",
    nacionalidad: "SUECA",
    rol: "TURISTA",
    fechaRegistro: "2026-06-26T10:00:00Z",
    identificacionValida: false,
    motivoIdInvalida: "VENCIDA",
    ordenArresto: false,
    estadoIngreso: "PENDIENTE"
  },
  {
    id: "8",
    rut: "7.777.777-7",
    nombre: "Carlos",
    apellido: "Berríos",
    email: "carlos.b@gmail.com",
    telefono: "+56955552222",
    nacionalidad: "CHILENA",
    rol: "VIAJERO",
    fechaRegistro: "2026-06-26T10:10:00Z",
    identificacionValida: true,
    motivoIdInvalida: "OK",
    ordenArresto: true,
    estadoIngreso: "PENDIENTE"
  }
];

let DB_VEHICULOS: Vehiculo[] = [
  {
    id: "1",
    patente: "DFGR-82",
    marca: "Toyota",
    modelo: "RAV4",
    propietarioRut: "12.345.678-9",
    paisRegistro: "CHILE",
    anio: 2021,
    tipoVehiculo: "PARTICULAR",
    numeroChasis: "JT3RE4RFX00192834",
    estado: "AUTORIZADO"
  },
  {
    id: "2",
    patente: "AE948LK",
    marca: "Volkswagen",
    modelo: "Amarok",
    propietarioRut: "95.421.350-K",
    paisRegistro: "ARGENTINA",
    anio: 2023,
    tipoVehiculo: "PARTICULAR",
    numeroChasis: "8AWZZZ2HZMA019283",
    estado: "PENDIENTE"
  },
  {
    id: "3",
    patente: "KLPW-15",
    marca: "Mercedes-Benz",
    modelo: "Sprinter",
    propietarioRut: "11.111.111-1",
    paisRegistro: "CHILE",
    anio: 2019,
    tipoVehiculo: "BUS",
    numeroChasis: "WDB9066331S829302",
    estado: "AUTORIZADO"
  }
];

let DB_DOCUMENTOS: Documento[] = [
  {
    id: "doc-1",
    tipo: "DECLARACION_SAG",
    titulo: "Declaración Jurada Conjunta SAG-Aduanas",
    viajeroRut: "12.345.678-9",
    viajeroNombre: "Esteban González",
    estado: "APROBADO",
    fechaCreacion: "2026-06-26T09:12:00Z",
    fechaValidacion: "2026-06-26T09:15:00Z",
    validadoPor: "Juan Valdés (SAG)",
    archivoNombre: "DJ_SAG_ADUANAS_123456789.pdf",
    datosContenido: {
      traeAlimentos: false,
      traeProductosVegetales: false,
      traeProductosAnimales: false,
      montoDivisas: 0,
      descripcionEquipaje: "Equipaje personal, ropa y artículos de camping limpios."
    },
    observaciones: "Inspección visual conforme. No transporta material orgánico restringido."
  },
  {
    id: "doc-2",
    tipo: "FORMULARIO_ADUANA",
    titulo: "Formularo de Admisión Temporal de Vehículo",
    viajeroRut: "95.421.350-K",
    viajeroNombre: "Mateo Fernández",
    estado: "PENDIENTE",
    fechaCreacion: "2026-06-26T11:45:00Z",
    archivoNombre: "FORM_ADUANA_AE948LK.pdf",
    datosContenido: {
      traeAlimentos: false,
      traeProductosVegetales: false,
      traeProductosAnimales: false,
      montoDivisas: 1200,
      patenteAsociada: "AE948LK",
      marcaVehiculo: "Volkswagen",
      modeloVehiculo: "Amarok",
      descripcionEquipaje: "Herramientas de viaje, maletas con vestuario."
    }
  },
  {
    id: "doc-3",
    tipo: "PERMISO_PDI",
    titulo: "Control de Ingreso/Salida Chile - Tarjeta Única Migratoria",
    viajeroRut: "95.421.350-K",
    viajeroNombre: "Mateo Fernández",
    estado: "APROBADO",
    fechaCreacion: "2026-06-26T11:40:00Z",
    fechaValidacion: "2026-06-26T11:42:00Z",
    validadoPor: "Carlos Pinto (PDI)",
    archivoNombre: "PDI_TUM_95421350K.pdf",
    datosContenido: {
      traeAlimentos: false,
      traeProductosVegetales: false,
      traeProductosAnimales: false,
      motivoViaje: "TURISMO",
      tiempoEstadiaDias: 15,
      direccionDestino: "Hotel Sheraton, Santiago, Chile"
    }
  }
];

// Helper to generate a fake JWT token mimicking industry standard
function generateSimulatedToken(user: Usuario): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    rut: user.rut,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    rol: user.rol,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  })).toString("base64url");
  const signature = Buffer.from("sgf-chile-secret-key-signature-2026").toString("base64url");
  return `${header}.${payload}.${signature}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing and cross-origin simulation
  app.use(express.json());

  // CORS-like header insertion
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Log API requests for our interactive dashboard logging feed
  const apiCallLogs: Array<{ timestamp: string; method: string; path: string; status: number; body?: any; response?: any }> = [];

  function logApiCall(method: string, path: string, status: number, reqBody?: any, resBody?: any) {
    apiCallLogs.unshift({
      timestamp: new Date().toLocaleTimeString('es-CL'),
      method,
      path,
      status,
      body: reqBody ? JSON.parse(JSON.stringify(reqBody)) : undefined,
      response: resBody ? JSON.parse(JSON.stringify(resBody)) : undefined
    });
    if (apiCallLogs.length > 50) apiCallLogs.pop();
  }

  // Debug logging feed endpoint
  app.get('/api/v1/debug-logs', (req, res) => {
    res.json(apiCallLogs);
  });

  // Clear logs
  app.post('/api/v1/debug-logs/clear', (req, res) => {
    apiCallLogs.length = 0;
    res.json({ status: "cleared" });
  });

  // ==========================================
  // 5. `/api/v1/login` → Inicio de sesión y control de acceso
  // ==========================================
  app.post('/api/v1/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      const err = { error: "Email y contraseña son requeridos" };
      logApiCall("POST", "/api/v1/login", 400, req.body, err);
      return res.status(400).json(err);
    }

    // Simple simulation passwords:
    // SAG inspector -> SgfSag2026!
    // Aduanas officer -> SgfAduana2026!
    // PDI officer -> SgfPdi2026!
    // Admin -> SgfAdmin2026!
    // Others -> password123
    const user = DB_USUARIOS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      const err = { error: "Usuario no registrado en el SGF" };
      logApiCall("POST", "/api/v1/login", 404, req.body, err);
      return res.status(404).json(err);
    }

    // Mock check (allowing simple fallback to password123 as well)
    const normalizedPassword = password.trim();
    let isCorrect = false;

    if (user.rol === "INSPECTOR_SAG" && normalizedPassword === "SgfSag2026!") isCorrect = true;
    else if (user.rol === "FUNCIONARIO_ADUANA" && normalizedPassword === "SgfAduana2026!") isCorrect = true;
    else if (user.rol === "OFICIAL_PDI" && normalizedPassword === "SgfPdi2026!") isCorrect = true;
    else if (user.rol === "ADMIN" && normalizedPassword === "SgfAdmin2026!") isCorrect = true;
    else if ((user.rol === "VIAJERO" || user.rol === "TURISTA") && (normalizedPassword === "password123" || normalizedPassword === "SgfViajero2026!")) isCorrect = true;
    else if (normalizedPassword === "password123") isCorrect = true; // global fallback

    if (!isCorrect) {
      const err = { error: "Contraseña incorrecta para el SGF" };
      logApiCall("POST", "/api/v1/login", 401, req.body, err);
      return res.status(401).json(err);
    }

    const token = generateSimulatedToken(user);
    const successRes = {
      token,
      usuario: {
        id: user.id,
        rut: user.rut,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        nacionalidad: user.nacionalidad,
        identificacionValida: user.identificacionValida !== undefined ? user.identificacionValida : true,
        motivoIdInvalida: user.motivoIdInvalida || "OK",
        ordenArresto: !!user.ordenArresto,
        estadoIngreso: user.estadoIngreso || "PENDIENTE"
      }
    };
    logApiCall("POST", "/api/v1/login", 200, req.body, successRes);
    res.json(successRes);
  });

  // ==========================================
  // Register Route for Turistas / Viajeros
  // ==========================================
  app.post('/api/v1/register', (req, res) => {
    const { rut, nombre, apellido, email, password, telefono, nacionalidad, rol } = req.body;

    if (!rut || !nombre || !apellido || !email || !nacionalidad) {
      const err = { error: "RUT, Nombre, Apellido, Email y Nacionalidad son obligatorios" };
      logApiCall("POST", "/api/v1/register", 400, req.body, err);
      return res.status(400).json(err);
    }

    if (DB_USUARIOS.some(u => u.rut === rut || u.email.toLowerCase() === email.toLowerCase())) {
      const err = { error: "El RUT o Correo Electrónico ya se encuentra registrado" };
      logApiCall("POST", "/api/v1/register", 400, req.body, err);
      return res.status(400).json(err);
    }

    const nuevoUsuario: Usuario = {
      id: String(DB_USUARIOS.length + 1),
      rut,
      nombre,
      apellido,
      email,
      telefono,
      nacionalidad: nacionalidad.toUpperCase(),
      rol: (rol as UserRole) || "TURISTA",
      fechaRegistro: new Date().toISOString(),
      identificacionValida: true,
      motivoIdInvalida: "OK",
      ordenArresto: false,
      estadoIngreso: "PENDIENTE"
    };

    DB_USUARIOS.push(nuevoUsuario);

    const token = generateSimulatedToken(nuevoUsuario);
    const successRes = {
      token,
      usuario: nuevoUsuario
    };

    logApiCall("POST", "/api/v1/register", 201, req.body, successRes);
    res.status(201).json(successRes);
  });

  // ==========================================
  // PDI Field Update Endpoint
  // ==========================================
  app.post('/api/v1/usuarios/:id/pdi-update', (req, res) => {
    const { identificacionValida, motivoIdInvalida, ordenArresto } = req.body;
    const user = DB_USUARIOS.find(u => u.id === req.params.id);

    if (!user) {
      const err = { error: "Usuario no encontrado" };
      logApiCall("POST", `/api/v1/usuarios/${req.params.id}/pdi-update`, 404, req.body, err);
      return res.status(404).json(err);
    }

    if (identificacionValida !== undefined) user.identificacionValida = !!identificacionValida;
    if (motivoIdInvalida !== undefined) user.motivoIdInvalida = motivoIdInvalida;
    if (ordenArresto !== undefined) user.ordenArresto = !!ordenArresto;

    // If arrest warrant is true or ID is invalid, set status appropriately or let PDI update
    logApiCall("POST", `/api/v1/usuarios/${req.params.id}/pdi-update`, 200, req.body, user);
    res.json(user);
  });

  // ==========================================
  // Border Access (Aduana / PDI / General) Status Update Endpoint
  // ==========================================
  app.post('/api/v1/usuarios/:id/estado-ingreso', (req, res) => {
    const { estadoIngreso } = req.body;
    const user = DB_USUARIOS.find(u => u.id === req.params.id);

    if (!user) {
      const err = { error: "Usuario no encontrado" };
      logApiCall("POST", `/api/v1/usuarios/${req.params.id}/estado-ingreso`, 404, req.body, err);
      return res.status(404).json(err);
    }

    if (estadoIngreso) {
      user.estadoIngreso = estadoIngreso;
    }

    logApiCall("POST", `/api/v1/usuarios/${req.params.id}/estado-ingreso`, 200, req.body, user);
    res.json(user);
  });

  // ==========================================
  // 1. `/api/v1/usuarios` → CRUD de usuarios
  // ==========================================
  app.get('/api/v1/usuarios', (req, res) => {
    logApiCall("GET", "/api/v1/usuarios", 200, null, DB_USUARIOS);
    res.json(DB_USUARIOS);
  });

  app.get('/api/v1/usuarios/:id', (req, res) => {
    const user = DB_USUARIOS.find(u => u.id === req.params.id);
    if (!user) {
      const err = { error: "Usuario no encontrado en SGF" };
      logApiCall("GET", `/api/v1/usuarios/${req.params.id}`, 404, null, err);
      return res.status(404).json(err);
    }
    logApiCall("GET", `/api/v1/usuarios/${req.params.id}`, 200, null, user);
    res.json(user);
  });

  app.post('/api/v1/usuarios', (req, res) => {
    const { rut, nombre, apellido, email, telefono, nacionalidad, rol } = req.body;

    if (!rut || !nombre || !apellido || !email || !nacionalidad) {
      const err = { error: "Los campos rut, nombre, apellido, email y nacionalidad son obligatorios" };
      logApiCall("POST", "/api/v1/usuarios", 400, req.body, err);
      return res.status(400).json(err);
    }

    if (DB_USUARIOS.some(u => u.rut === rut)) {
      const err = { error: "El RUT ingresado ya está registrado en el SGF" };
      logApiCall("POST", "/api/v1/usuarios", 400, req.body, err);
      return res.status(400).json(err);
    }

    const nuevoUsuario: Usuario = {
      id: String(DB_USUARIOS.length + 1),
      rut,
      nombre,
      apellido,
      email,
      telefono,
      nacionalidad: nacionalidad.toUpperCase(),
      rol: (rol as UserRole) || "VIAJERO",
      fechaRegistro: new Date().toISOString()
    };

    DB_USUARIOS.push(nuevoUsuario);
    logApiCall("POST", "/api/v1/usuarios", 201, req.body, nuevoUsuario);
    res.status(201).json(nuevoUsuario);
  });

  app.put('/api/v1/usuarios/:id', (req, res) => {
    const { nombre, apellido, email, telefono, nacionalidad, rol } = req.body;
    const index = DB_USUARIOS.findIndex(u => u.id === req.params.id);

    if (index === -1) {
      const err = { error: "Usuario no encontrado" };
      logApiCall("PUT", `/api/v1/usuarios/${req.params.id}`, 404, req.body, err);
      return res.status(404).json(err);
    }

    const updatedUser = {
      ...DB_USUARIOS[index],
      nombre: nombre || DB_USUARIOS[index].nombre,
      apellido: apellido || DB_USUARIOS[index].apellido,
      email: email || DB_USUARIOS[index].email,
      telefono: telefono || DB_USUARIOS[index].telefono,
      nacionalidad: nacionalidad ? nacionalidad.toUpperCase() : DB_USUARIOS[index].nacionalidad,
      rol: (rol as UserRole) || DB_USUARIOS[index].rol
    };

    DB_USUARIOS[index] = updatedUser;
    logApiCall("PUT", `/api/v1/usuarios/${req.params.id}`, 200, req.body, updatedUser);
    res.json(updatedUser);
  });

  app.delete('/api/v1/usuarios/:id', (req, res) => {
    const index = DB_USUARIOS.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      const err = { error: "Usuario no encontrado" };
      logApiCall("DELETE", `/api/v1/usuarios/${req.params.id}`, 404, null, err);
      return res.status(404).json(err);
    }

    const removed = DB_USUARIOS[index];
    DB_USUARIOS.splice(index, 1);
    const successRes = { mensaje: "Usuario eliminado correctamente del SGF", id: removed.id };
    logApiCall("DELETE", `/api/v1/usuarios/${req.params.id}`, 200, null, successRes);
    res.json(successRes);
  });


  // ==========================================
  // 2. `/api/v1/vehiculos` → CRUD de vehículos
  // ==========================================
  app.get('/api/v1/vehiculos', (req, res) => {
    logApiCall("GET", "/api/v1/vehiculos", 200, null, DB_VEHICULOS);
    res.json(DB_VEHICULOS);
  });

  app.get('/api/v1/vehiculos/patente/:patente', (req, res) => {
    const cleanPatente = req.params.patente.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const v = DB_VEHICULOS.find(v => v.patente.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanPatente);
    if (!v) {
      const err = { error: "Vehículo no registrado en el SGF" };
      logApiCall("GET", `/api/v1/vehiculos/patente/${req.params.patente}`, 404, null, err);
      return res.status(404).json(err);
    }
    logApiCall("GET", `/api/v1/vehiculos/patente/${req.params.patente}`, 200, null, v);
    res.json(v);
  });

  app.post('/api/v1/vehiculos', (req, res) => {
    const { patente, marca, modelo, propietarioRut, paisRegistro, anio, tipoVehiculo, numeroChasis } = req.body;

    if (!patente || !marca || !modelo || !propietarioRut || !paisRegistro || !anio || !tipoVehiculo) {
      const err = { error: "Los campos patente, marca, modelo, propietarioRut, paisRegistro, anio y tipoVehiculo son obligatorios" };
      logApiCall("POST", "/api/v1/vehiculos", 400, req.body, err);
      return res.status(400).json(err);
    }

    const normalizedPatente = patente.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (DB_VEHICULOS.some(v => v.patente.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPatente)) {
      const err = { error: "La patente del vehículo ya se encuentra registrada en el SGF" };
      logApiCall("POST", "/api/v1/vehiculos", 400, req.body, err);
      return res.status(400).json(err);
    }

    const nuevoVehiculo: Vehiculo = {
      id: String(DB_VEHICULOS.length + 1),
      patente: patente.toUpperCase(),
      marca,
      modelo,
      propietarioRut,
      paisRegistro: paisRegistro.toUpperCase(),
      anio: Number(anio),
      tipoVehiculo: tipoVehiculo.toUpperCase() as any,
      numeroChasis,
      estado: "PENDIENTE" // Default is pending customs validation
    };

    DB_VEHICULOS.push(nuevoVehiculo);
    logApiCall("POST", "/api/v1/vehiculos", 201, req.body, nuevoVehiculo);
    res.status(201).json(nuevoVehiculo);
  });

  app.put('/api/v1/vehiculos/:id', (req, res) => {
    const { marca, modelo, propietarioRut, paisRegistro, anio, estado, numeroChasis } = req.body;
    const index = DB_VEHICULOS.findIndex(v => v.id === req.params.id);

    if (index === -1) {
      const err = { error: "Vehículo no encontrado" };
      logApiCall("PUT", `/api/v1/vehiculos/${req.params.id}`, 404, req.body, err);
      return res.status(404).json(err);
    }

    const updatedVehiculo = {
      ...DB_VEHICULOS[index],
      marca: marca || DB_VEHICULOS[index].marca,
      modelo: modelo || DB_VEHICULOS[index].modelo,
      propietarioRut: propietarioRut || DB_VEHICULOS[index].propietarioRut,
      paisRegistro: paisRegistro ? paisRegistro.toUpperCase() : DB_VEHICULOS[index].paisRegistro,
      anio: anio ? Number(anio) : DB_VEHICULOS[index].anio,
      estado: estado ? (estado.toUpperCase() as any) : DB_VEHICULOS[index].estado,
      numeroChasis: numeroChasis !== undefined ? numeroChasis : DB_VEHICULOS[index].numeroChasis
    };

    DB_VEHICULOS[index] = updatedVehiculo;
    logApiCall("PUT", `/api/v1/vehiculos/${req.params.id}`, 200, req.body, updatedVehiculo);
    res.json(updatedVehiculo);
  });

  app.delete('/api/v1/vehiculos/:id', (req, res) => {
    const index = DB_VEHICULOS.findIndex(v => v.id === req.params.id);
    if (index === -1) {
      const err = { error: "Vehículo no encontrado" };
      logApiCall("DELETE", `/api/v1/vehiculos/${req.params.id}`, 404, null, err);
      return res.status(404).json(err);
    }

    const removed = DB_VEHICULOS[index];
    DB_VEHICULOS.splice(index, 1);
    const successRes = { mensaje: "Vehículo eliminado correctamente del SGF", id: removed.id };
    logApiCall("DELETE", `/api/v1/vehiculos/${req.params.id}`, 200, null, successRes);
    res.json(successRes);
  });


  // ==========================================
  // 3. `/api/v1/documentos` → Gestión y validación de documentos
  // ==========================================
  app.get('/api/v1/documentos', (req, res) => {
    logApiCall("GET", "/api/v1/documentos", 200, null, DB_DOCUMENTOS);
    res.json(DB_DOCUMENTOS);
  });

  app.get('/api/v1/documentos/viajero/:rut', (req, res) => {
    const viajeroDocs = DB_DOCUMENTOS.filter(d => d.viajeroRut.replace(/[^0-9Kk]/g, '') === req.params.rut.replace(/[^0-9Kk]/g, ''));
    logApiCall("GET", `/api/v1/documentos/viajero/${req.params.rut}`, 200, null, viajeroDocs);
    res.json(viajeroDocs);
  });

  app.post('/api/v1/documentos', (req, res) => {
    const { tipo, viajeroRut, viajeroNombre, datosContenido } = req.body;

    if (!tipo || !viajeroRut || !viajeroNombre || !datosContenido) {
      const err = { error: "Los campos tipo, viajeroRut, viajeroNombre y datosContenido son obligatorios" };
      logApiCall("POST", "/api/v1/documentos", 400, req.body, err);
      return res.status(400).json(err);
    }

    let titulo = "Documento de Frontera";
    if (tipo === "DECLARACION_SAG") titulo = "Declaración Jurada Conjunta SAG-Aduanas";
    else if (tipo === "FORMULARIO_ADUANA") titulo = "Admisión Temporal de Vehículo";
    else if (tipo === "PERMISO_PDI") titulo = "Tarjeta Única Migratoria - Control PDI";
    else if (tipo === "SOAPEX") titulo = "Seguro Obligatorio SOAPEX Extranjeros";

    const nuevoDoc: Documento = {
      id: "doc-" + Date.now(),
      tipo: tipo.toUpperCase() as any,
      titulo,
      viajeroRut,
      viajeroNombre,
      estado: "PENDIENTE",
      fechaCreacion: new Date().toISOString(),
      archivoNombre: `DJ_${tipo}_${viajeroRut.replace(/[^0-9Kk]/g, '')}_${Date.now().toString().slice(-4)}.pdf`,
      datosContenido
    };

    DB_DOCUMENTOS.push(nuevoDoc);
    logApiCall("POST", "/api/v1/documentos", 201, req.body, nuevoDoc);
    res.status(201).json(nuevoDoc);
  });

  // Endpoints for validation/signature of SAG/Aduana/PDI documents
  app.post('/api/v1/documentos/:id/validar', (req, res) => {
    const { estado, oficialId, observaciones } = req.body;
    const doc = DB_DOCUMENTOS.find(d => d.id === req.params.id);

    if (!doc) {
      const err = { error: "Documento no encontrado" };
      logApiCall("POST", `/api/v1/documentos/${req.params.id}/validar`, 404, req.body, err);
      return res.status(404).json(err);
    }

    if (!estado || (estado !== 'APROBADO' && estado !== 'RECHAZADO')) {
      const err = { error: "El estado de validación debe ser APROBADO o RECHAZADO" };
      logApiCall("POST", `/api/v1/documentos/${req.params.id}/validar`, 400, req.body, err);
      return res.status(400).json(err);
    }

    doc.estado = estado;
    doc.fechaValidacion = new Date().toISOString();
    doc.validadoPor = oficialId || "Inspector de Turno SGF";
    doc.observaciones = observaciones || "Validación digital procesada mediante SGF Chile";

    // If it's a vehicle form and gets approved, automatically approve vehicle status if registered!
    if (doc.tipo === "FORMULARIO_ADUANA" && doc.datosContenido.patenteAsociada && estado === "APROBADO") {
      const assocPatente = doc.datosContenido.patenteAsociada.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const veh = DB_VEHICULOS.find(v => v.patente.toUpperCase().replace(/[^A-Z0-9]/g, '') === assocPatente);
      if (veh) {
        veh.estado = "AUTORIZADO";
      }
    }

    const successRes = {
      mensaje: "Documento validado correctamente en SGF",
      documentoId: doc.id,
      nuevoEstado: doc.estado,
      validadoPor: doc.validadoPor,
      fechaValidacion: doc.fechaValidacion
    };

    logApiCall("POST", `/api/v1/documentos/${req.params.id}/validar`, 200, req.body, successRes);
    res.json(successRes);
  });


  // ==========================================
  // 4. `/api/v1/reportes` → Generación de reportes estadísticos
  // ==========================================
  app.get('/api/v1/reportes', (req, res) => {
    const reporte: ReporteEstadistico = {
      fechaGeneracion: new Date().toISOString(),
      rangoFechas: "Últimas 24 Horas",
      totalViajeros: DB_USUARIOS.filter(u => u.rol === 'VIAJERO').length + 1435, // scale factors to feel like real traffic
      totalVehiculos: DB_VEHICULOS.length + 512,
      totalDocumentosAprobados: DB_DOCUMENTOS.filter(d => d.estado === 'APROBADO').length + 2840,
      totalDocumentosRechazados: DB_DOCUMENTOS.filter(d => d.estado === 'RECHAZADO').length + 42,
      tiempoEsperaPromedioAntes: 14.5, // 14.5 hours on average before SGF
      tiempoEsperaPromedioAhora: 4.8,  // 4.8 minutes after SGF!
      desglosePasos: [
        {
          pasoNombre: "Paso Los Libertadores (Valparaíso - Mendoza)",
          tiempoEsperaSinSgf: 16.2,
          tiempoEsperaConSgf: 5.1,
          vehiculosProcesados: 2940,
          alertasDetectadas: 14
        },
        {
          pasoNombre: "Paso Cardenal Samoré (Los Lagos - Neuquén)",
          tiempoEsperaSinSgf: 9.5,
          tiempoEsperaConSgf: 3.2,
          vehiculosProcesados: 1240,
          alertasDetectadas: 3
        },
        {
          pasoNombre: "Paso Pehuenche (Maule - Mendoza)",
          tiempoEsperaSinSgf: 12.0,
          tiempoEsperaConSgf: 4.0,
          vehiculosProcesados: 680,
          alertasDetectadas: 1
        },
        {
          pasoNombre: "Paso Jama (Antofagasta - Jujuy)",
          tiempoEsperaSinSgf: 8.4,
          tiempoEsperaConSgf: 3.0,
          vehiculosProcesados: 412,
          alertasDetectadas: 5
        }
      ]
    };

    logApiCall("GET", "/api/v1/reportes", 200, null, reporte);
    res.json(reporte);
  });

  // Export report endpoint as requested (Excel/PDF formatted mock bytes)
  app.get('/api/v1/reportes/exportar', (req, res) => {
    const format = (req.query.formato as string || "pdf").toLowerCase();
    let filename = "SGF_REPORTE_METRICAS_CHILE";
    let mockContent = "";

    if (format === "pdf") {
      filename += ".pdf";
      res.setHeader('Content-Type', 'application/pdf');
      mockContent = "%PDF-1.4\n%SGF Chile Reporte de Automatización de Fronteras\n" +
                    `Generado el: ${new Date().toLocaleDateString('es-CL')}\n` +
                    "Estadísticas de Reducción de Tiempos de Espera:\n" +
                    "Antes: 14.5 horas | Ahora con SGF: 4.8 minutos.\n" +
                    "Documentos validados por SAG, Aduanas y PDI con firma digital.\n" +
                    "%%EOF";
    } else {
      filename += ".xlsx";
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      mockContent = "RUT,Nombre,Vehiculo,Paso,EsperaSinSGF,EsperaConSGF,Estado\n" +
                    "12.345.678-9,Esteban Gonzalez,DFGR-82,Los Libertadores,16.2,5.1,Aprobado\n" +
                    "95.421.350-K,Mateo Fernandez,AE948LK,Pehuenche,12.0,4.0,Pendiente";
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    logApiCall("GET", `/api/v1/reportes/exportar?formato=${format}`, 200, null, { file: filename, bytesSent: mockContent.length });
    res.send(Buffer.from(mockContent));
  });

  // ==========================================
  // Vite assets or SPA catchall fallback
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SGF Backend] Running on http://localhost:${PORT}`);
  });
}

startServer();
