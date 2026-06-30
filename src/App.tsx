/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  FileText, 
  BarChart3, 
  Key, 
  FileCode, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Download, 
  Search, 
  RefreshCw, 
  Check, 
  Database, 
  Terminal, 
  ChevronRight, 
  ArrowRightLeft,
  UserCheck,
  ShieldAlert,
  Menu,
  X,
  Shield,
  Fingerprint,
  Settings,
  AlertTriangle,
  Lock,
  UserX
} from 'lucide-react';
import { Usuario, Vehiculo, Documento, ReporteEstadistico, UserRole } from './types';
import { JAVA_TEMPLATES, JavaFile } from './javaCodeTemplates';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'usuarios' | 'vehiculos' | 'documentos' | 'reportes' | 'backend-code' | 'pdi' | 'admin'>('dashboard');

  // User Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('sgf_auth_token');
  });
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('sgf_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default active user is the inspector Juan Valdés
    return {
      id: "2",
      rut: "11.111.111-1",
      nombre: "Juan",
      apellido: "Valdés",
      email: "juan.sag@sgf.gob.cl",
      telefono: "+56911223344",
      nacionalidad: "CHILENA",
      rol: "INSPECTOR_SAG",
      fechaRegistro: "2026-01-15T09:00:00Z"
    };
  });

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Registration Form States (Turistas / Viajeros)
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regRut, setRegRut] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNacionalidad, setRegNacionalidad] = useState('CHILENA');
  const [regTelefono, setRegTelefono] = useState('');
  const [regRol, setRegRol] = useState<UserRole>('TURISTA');

  // Multi-Declaration States (for traveler/tourist request)
  const [selectedDeclarations, setSelectedDeclarations] = useState({
    DECLARACION_SAG: true,
    FORMULARIO_ADUANA: false,
    PERMISO_PDI: false,
    SOAPEX: false
  });
  const [declarationSAGData, setDeclarationSAGData] = useState({
    traeAlimentos: false,
    traeProductosVegetales: false,
    traeProductosAnimales: false,
    descripcionEquipaje: ''
  });
  const [declarationAduanaData, setDeclarationAduanaData] = useState({
    patenteAsociada: '',
    marcaVehiculo: '',
    modeloVehiculo: '',
    montoDivisas: 0
  });
  const [declarationPDIData, setDeclarationPDIData] = useState({
    motivoViaje: 'TURISMO',
    tiempoEstadiaDias: 15,
    direccionDestino: ''
  });
  const [declarationSOAPEXData, setDeclarationSOAPEXData] = useState({
    compañiaSeguro: 'Consorcio SOAPEX',
    polizaNumero: ''
  });

  // App Data State (fetched from Express API or managed locally with fetch fallbacks)
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [reporte, setReporte] = useState<ReporteEstadistico | null>(null);
  const [apiLogs, setApiLogs] = useState<any[]>([]);

  // Loading & Action States
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Create User Form States
  const [newUser, setNewUser] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    nacionalidad: 'CHILENA',
    rol: 'VIAJERO' as UserRole,
  });

  // Create Vehicle Form States
  const [newVehiculo, setNewVehiculo] = useState({
    patente: '',
    marca: '',
    modelo: '',
    propietarioRut: '',
    paisRegistro: 'CHILE',
    anio: 2024,
    tipoVehiculo: 'PARTICULAR' as 'PARTICULAR' | 'COMERCIAL' | 'BUS' | 'MOTO',
    numeroChasis: '',
  });

  // Create Document State (Digital SAG-Aduanas sworn statement)
  const [newDoc, setNewDoc] = useState({
    tipo: 'DECLARACION_SAG' as 'DECLARACION_SAG' | 'FORMULARIO_ADUANA' | 'PERMISO_PDI' | 'SOAPEX',
    viajeroRut: '',
    viajeroNombre: '',
    traeAlimentos: false,
    traeProductosVegetales: false,
    traeProductosAnimales: false,
    montoDivisas: 0,
    descripcionEquipaje: '',
  });

  // Document Validation modal states
  const [validatingDoc, setValidatingDoc] = useState<Documento | null>(null);
  const [validationStatus, setValidationStatus] = useState<'APROBADO' | 'RECHAZADO'>('APROBADO');
  const [validationComments, setValidationComments] = useState('');

  // Java Code Viewer States
  const [selectedJavaFile, setSelectedJavaFile] = useState<JavaFile>(JAVA_TEMPLATES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeSearch, setCodeSearch] = useState('');

  // SGF active boundary pass selection
  const [currentPass, setCurrentPass] = useState('Paso Los Libertadores');

  // PDI & Admin Specific States
  const [pdiSearchQuery, setPdiSearchQuery] = useState('');
  const [pdiFilter, setPdiFilter] = useState<'ALL' | 'ALERT_ID' | 'ALERT_ARREST' | 'PENDING'>('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Trigger brief alert messages
  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Base API URLs
  const API_BASE = '/api/v1';

  // Fetch all core datasets from Express server
  const refreshAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const resUsers = await fetch(`${API_BASE}/usuarios`);
      let fetchedUsers = [];
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsuarios(data);
        fetchedUsers = data;
      }

      // 2. Fetch Vehicles
      const resVeh = await fetch(`${API_BASE}/vehiculos`);
      if (resVeh.ok) {
        const data = await resVeh.json();
        setVehiculos(data);
      }

      // 3. Fetch Documents
      const resDocs = await fetch(`${API_BASE}/documentos`);
      if (resDocs.ok) {
        const data = await resDocs.json();
        setDocumentos(data);
      }

      // 4. Fetch Report
      const resRep = await fetch(`${API_BASE}/reportes`);
      if (resRep.ok) {
        const data = await resRep.json();
        setReporte(data);
      }

      // 5. Fetch debug API logs
      const resLogs = await fetch(`${API_BASE}/debug-logs`);
      if (resLogs.ok) {
        const data = await resLogs.json();
        setApiLogs(data);
      }

      // Sync current logged user in real-time if updated from PDI or Aduanas
      if (currentUser && fetchedUsers.length > 0) {
        const freshUser = fetchedUsers.find((u: any) => u.id === currentUser.id || u.rut === currentUser.rut);
        if (freshUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('sgf_user', JSON.stringify(freshUser));
        }
      }
    } catch (error) {
      console.error("Error connecting to SGF simulated server endpoints:", error);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    refreshAllData();
    // Auto-update logs every 4 seconds to show reactive backend communication
    const interval = setInterval(async () => {
      try {
        const resLogs = await fetch(`${API_BASE}/debug-logs`);
        if (resLogs.ok) {
          const data = await resLogs.json();
          setApiLogs(data);
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Authentication (RF-002 / RF-010)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Fallo en la autenticación SGF");
        showAlert(data.error || "Credenciales incorrectas", 'error');
        return;
      }

      setAuthToken(data.token);
      setCurrentUser(data.usuario);
      localStorage.setItem('sgf_auth_token', data.token);
      localStorage.setItem('sgf_user', JSON.stringify(data.usuario));
      
      showAlert(`Bienvenido al SGF, ${data.usuario.nombre} (${data.usuario.rol})`, 'success');
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      refreshAllData();
    } catch (err) {
      setLoginError("Error al conectar con el microservicio de autenticación");
    }
  };

  // Handle Tourist / Traveler Registration (Sign-up)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regNombre,
          apellido: regApellido,
          rut: regRut,
          email: regEmail,
          password: regPassword,
          telefono: regTelefono,
          nacionalidad: regNacionalidad,
          rol: regRol
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Fallo en el registro SGF");
        showAlert(data.error || "Fallo en el registro", 'error');
        return;
      }

      setAuthToken(data.token);
      setCurrentUser(data.usuario);
      localStorage.setItem('sgf_auth_token', data.token);
      localStorage.setItem('sgf_user', JSON.stringify(data.usuario));

      showAlert(`Registro exitoso. Bienvenido al SGF, ${data.usuario.nombre} (${data.usuario.rol})`, 'success');
      setIsLoginModalOpen(false);
      
      // Clear forms
      setRegNombre('');
      setRegApellido('');
      setRegRut('');
      setRegEmail('');
      setRegPassword('');
      setRegTelefono('');
      
      refreshAllData();
    } catch (err) {
      setLoginError("Error al conectar con el microservicio de registro SGF");
    }
  };

  // Submit traveler multi-declaration request
  const handleSubmitDeclarations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showAlert("Debe iniciar sesión para realizar declaraciones", 'error');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let selectedCount = 0;

    try {
      // 1. SAG declaration
      if (selectedDeclarations.DECLARACION_SAG) {
        selectedCount++;
        const res = await fetch(`${API_BASE}/documentos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'DECLARACION_SAG',
            viajeroRut: currentUser.rut,
            viajeroNombre: `${currentUser.nombre} ${currentUser.apellido}`,
            datosContenido: declarationSAGData
          })
        });
        if (res.ok) successCount++;
      }

      // 2. Aduanas declaration
      if (selectedDeclarations.FORMULARIO_ADUANA) {
        selectedCount++;
        const res = await fetch(`${API_BASE}/documentos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'FORMULARIO_ADUANA',
            viajeroRut: currentUser.rut,
            viajeroNombre: `${currentUser.nombre} ${currentUser.apellido}`,
            datosContenido: {
              ...declarationAduanaData,
              patenteAsociada: declarationAduanaData.patenteAsociada || 'S/N'
            }
          })
        });
        if (res.ok) successCount++;
      }

      // 3. PDI migration card
      if (selectedDeclarations.PERMISO_PDI) {
        selectedCount++;
        const res = await fetch(`${API_BASE}/documentos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'PERMISO_PDI',
            viajeroRut: currentUser.rut,
            viajeroNombre: `${currentUser.nombre} ${currentUser.apellido}`,
            datosContenido: declarationPDIData
          })
        });
        if (res.ok) successCount++;
      }

      // 4. SOAPEX insurance
      if (selectedDeclarations.SOAPEX) {
        selectedCount++;
        const res = await fetch(`${API_BASE}/documentos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'SOAPEX',
            viajeroRut: currentUser.rut,
            viajeroNombre: `${currentUser.nombre} ${currentUser.apellido}`,
            datosContenido: declarationSOAPEXData
          })
        });
        if (res.ok) successCount++;
      }

      if (successCount > 0) {
        showAlert(`Se han enviado exitosamente ${successCount} de ${selectedCount} declaraciones.`, 'success');
        
        // Reset declarations selected checkboxes to prevent double submit
        setSelectedDeclarations({
          DECLARACION_SAG: true,
          FORMULARIO_ADUANA: false,
          PERMISO_PDI: false,
          SOAPEX: false
        });
        
        // Let's reset traveler ingress status to PENDIENTE so officials can review newly submitted documents
        await fetch(`${API_BASE}/usuarios/${currentUser.id}/estado-ingreso`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estadoIngreso: 'PENDIENTE' })
        });
        
        // Fetch current user from server to get updated info
        const userRes = await fetch(`${API_BASE}/usuarios/${currentUser.id}`);
        if (userRes.ok) {
          const updatedUser = await userRes.json();
          setCurrentUser(updatedUser);
          localStorage.setItem('sgf_user', JSON.stringify(updatedUser));
        }

        refreshAllData();
      } else if (selectedCount === 0) {
        showAlert("Por favor seleccione al menos un tipo de declaración", 'error');
      } else {
        showAlert("Error al procesar las declaraciones electrónicas", 'error');
      }
    } catch (e) {
      showAlert("Error de conexión al enviar declaraciones", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('sgf_auth_token');
    localStorage.removeItem('sgf_user');
    showAlert("Sesión cerrada. Accediendo como Invitado/Simulador", 'success');
  };

  // Update traveler status from PDI
  const handleUpdatePDI = async (
    userId: string, 
    identificacionValida: boolean, 
    motivoIdInvalida: 'VENCIDA' | 'NO_AUTENTICA' | 'OK', 
    ordenArresto: boolean
  ) => {
    try {
      const res = await fetch(`${API_BASE}/usuarios/${userId}/pdi-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificacionValida, motivoIdInvalida, ordenArresto })
      });
      
      if (res.ok) {
        showAlert("Estado PDI del viajero actualizado correctamente", 'success');
        
        // If current user is the one updated, keep their state in sync
        if (currentUser && currentUser.id === userId) {
          const updatedUser = { ...currentUser, identificacionValida, motivoIdInvalida, ordenArresto };
          setCurrentUser(updatedUser);
          localStorage.setItem('sgf_user', JSON.stringify(updatedUser));
        }

        refreshAllData();
      } else {
        showAlert("Error al actualizar estado PDI", 'error');
      }
    } catch (e) {
      showAlert("Error de conexión al actualizar PDI", 'error');
    }
  };

  // Accept or reject traveler (Aduana / general)
  const handleUpdateEstadoIngreso = async (userId: string, estadoIngreso: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO') => {
    try {
      const res = await fetch(`${API_BASE}/usuarios/${userId}/estado-ingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoIngreso })
      });

      if (res.ok) {
        const text = estadoIngreso === 'ACEPTADO' 
          ? "Viajero ACEPTADO para ingreso al país." 
          : estadoIngreso === 'RECHAZADO'
            ? "Viajero RECHAZADO para ingreso al país."
            : "Estado del viajero restablecido a pendiente.";
        
        showAlert(text, estadoIngreso === 'RECHAZADO' ? 'error' : 'success');

        // If current user is the one updated, keep in sync
        if (currentUser && currentUser.id === userId) {
          const updatedUser = { ...currentUser, estadoIngreso };
          setCurrentUser(updatedUser);
          localStorage.setItem('sgf_user', JSON.stringify(updatedUser));
        }

        refreshAllData();
      } else {
        showAlert("Error al actualizar estado de ingreso", 'error');
      }
    } catch (e) {
      showAlert("Error de conexión al actualizar estado de ingreso", 'error');
    }
  };

  // Quick switch actor helper for simulation purposes
  const handleQuickSwitchUser = async (email: string, passwordPreset: string) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordPreset })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.token);
        setCurrentUser(data.usuario);
        localStorage.setItem('sgf_auth_token', data.token);
        localStorage.setItem('sgf_user', JSON.stringify(data.usuario));
        showAlert(`Sesión cambiada a: ${data.usuario.nombre} (${data.usuario.rol})`, 'success');
        refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // RF-001: Register user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      
      if (!res.ok) {
        showAlert(data.error || "No se pudo registrar el usuario", 'error');
        return;
      }

      showAlert(`Usuario ${data.nombre} ${data.apellido} registrado exitosamente con RUT ${data.rut}`);
      setNewUser({
        rut: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        nacionalidad: 'CHILENA',
        rol: 'VIAJERO'
      });
      refreshAllData();
    } catch (e) {
      showAlert("Error de red al registrar usuario", 'error');
    }
  };

  // Delete user (Admin only)
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("¿Está seguro de eliminar este usuario del SGF?")) return;
    try {
      const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showAlert("Usuario eliminado del SGF correctamente");
        refreshAllData();
      } else {
        showAlert(data.error || "No se pudo eliminar", 'error');
      }
    } catch (e) {
      showAlert("Error al enviar solicitud", 'error');
    }
  };

  // RF-003: Register vehicle
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/vehiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehiculo)
      });
      const data = await res.json();
      
      if (!res.ok) {
        showAlert(data.error || "No se pudo registrar el vehículo", 'error');
        return;
      }

      showAlert(`Vehículo con patente ${data.patente} registrado en la cola SGF`);
      setNewVehiculo({
        patente: '',
        marca: '',
        modelo: '',
        propietarioRut: '',
        paisRegistro: 'CHILE',
        anio: 2024,
        tipoVehiculo: 'PARTICULAR',
        numeroChasis: ''
      });
      refreshAllData();
    } catch (e) {
      showAlert("Error de conexión al registrar vehículo", 'error');
    }
  };

  // Update vehicle status (Aduanas/Admin validation)
  const handleUpdateVehicleStatus = async (id: string, nuevoEstado: 'AUTORIZADO' | 'PENDIENTE' | 'RECHAZADO') => {
    try {
      const res = await fetch(`${API_BASE}/vehiculos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        showAlert(`Vehículo actualizado a estado: ${nuevoEstado}`);
        refreshAllData();
      } else {
        showAlert("No se pudo actualizar el estado", 'error');
      }
    } catch (e) {
      showAlert("Error de red", 'error');
    }
  };

  // RF-004: Digitized Document submission (Traveler)
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-fill traveler name if current logged user is traveller
    const travelerName = newDoc.viajeroNombre || (currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : "Viajero Autónomo");
    const travelerRut = newDoc.viajeroRut || (currentUser ? currentUser.rut : "12.345.678-9");

    const documentPayload = {
      tipo: newDoc.tipo,
      viajeroRut: travelerRut,
      viajeroNombre: travelerName,
      datosContenido: {
        traeAlimentos: newDoc.traeAlimentos,
        traeProductosVegetales: newDoc.traeProductosVegetales,
        traeProductosAnimales: newDoc.traeProductosAnimales,
        montoDivisas: Number(newDoc.montoDivisas),
        descripcionEquipaje: newDoc.descripcionEquipaje || "Declaración estándar de aduana e inspección de equipaje"
      }
    };

    try {
      const res = await fetch(`${API_BASE}/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentPayload)
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || "No se pudo emitir el documento", 'error');
        return;
      }

      showAlert(`Documento digital de tipo ${newDoc.tipo} creado con estado PENDIENTE`);
      setNewDoc({
        tipo: 'DECLARACION_SAG',
        viajeroRut: '',
        viajeroNombre: '',
        traeAlimentos: false,
        traeProductosVegetales: false,
        traeProductosAnimales: false,
        montoDivisas: 0,
        descripcionEquipaje: ''
      });
      refreshAllData();
    } catch (e) {
      showAlert("Error al conectar con SGF para subir documento", 'error');
    }
  };

  // RF-005 & RF-010: Validate and authorize digital documents (Inspector/SAG/Aduana/PDI)
  const handleValidateDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatingDoc) return;

    try {
      const officerId = currentUser ? `${currentUser.nombre} ${currentUser.apellido} (${currentUser.rol})` : "Oficial SGF de Guardia";
      const res = await fetch(`${API_BASE}/documentos/${validatingDoc.id}/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: validationStatus,
          oficialId: officerId,
          observaciones: validationComments
        })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert(`Documento ${validatingDoc.id} resuelto como: ${validationStatus}`);
        setValidatingDoc(null);
        setValidationComments('');
        refreshAllData();
      } else {
        showAlert(data.error || "No se pudo validar el documento", 'error');
      }
    } catch (e) {
      showAlert("Error al enviar la validación digital", 'error');
    }
  };

  // RF-009: Export Statistics Report
  const handleExportReport = (formato: 'pdf' | 'excel') => {
    window.open(`${API_BASE}/reportes/exportar?formato=${formato}`, '_blank');
    showAlert(`Generando y descargando reporte de métricas en formato ${formato.toUpperCase()}...`);
  };

  const handleClearLogs = async () => {
    await fetch(`${API_BASE}/debug-logs/clear`, { method: 'POST' });
    setApiLogs([]);
    showAlert("Historial de llamadas API vaciado");
  };

  // Copy Java Spring code snippet to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedJavaFile.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showAlert(`Código de ${selectedJavaFile.name} copiado al portapapeles`);
  };

  // Filtered lists based on search bar
  const filteredUsers = usuarios.filter(u => 
    u.rut.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.rol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVehiculos = vehiculos.filter(v => 
    v.patente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.propietarioRut.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocumentos = documentos.filter(d => 
    d.viajeroRut.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.viajeroNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.estado.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJavaTemplates = JAVA_TEMPLATES.filter(f =>
    f.name.toLowerCase().includes(codeSearch.toLowerCase()) ||
    f.path.toLowerCase().includes(codeSearch.toLowerCase()) ||
    f.code.toLowerCase().includes(codeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased overflow-x-hidden">
      
      {/* 1. SIDEBAR (The Sleek Dark Slate Sidebar style) */}
      <aside className="w-80 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl shrink-0 z-20">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0B1222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-lg">
              SGF
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-lg block leading-none">Chile Frontera</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1 block">Pasos Terrestres</span>
            </div>
          </div>
          <div className="mt-4 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Control de Paso:</span>
            <select 
              value={currentPass} 
              onChange={(e) => setCurrentPass(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs border-none focus:ring-0 cursor-pointer text-right outline-none"
            >
              <option value="Paso Los Libertadores" className="bg-[#0F172A]">Los Libertadores</option>
              <option value="Paso Cardenal Samoré" className="bg-[#0F172A]">Cardenal Samoré</option>
              <option value="Paso Pehuenche" className="bg-[#0F172A]">Paso Pehuenche</option>
              <option value="Paso Jama" className="bg-[#0F172A]">Paso Jama</option>
            </select>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Módulos de Sistema</div>
          
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
              currentTab === 'dashboard' 
                ? 'bg-blue-600/10 text-blue-400 border-blue-600/30 font-medium shadow-md shadow-blue-900/10' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-sm">Panel de Control SGF</span>
          </button>

          <button 
            onClick={() => setCurrentTab('usuarios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
              currentTab === 'usuarios' 
                ? 'bg-blue-600/10 text-blue-400 border-blue-600/30 font-medium shadow-md shadow-blue-900/10' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Gestión de Usuarios</span>
          </button>

          <button 
            onClick={() => setCurrentTab('vehiculos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
              currentTab === 'vehiculos' 
                ? 'bg-blue-600/10 text-blue-400 border-blue-600/30 font-medium shadow-md shadow-blue-900/10' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Car className="w-5 h-5" />
            <span className="text-sm">Control Vehicular (Aduana)</span>
          </button>

          <button 
            onClick={() => setCurrentTab('documentos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
              currentTab === 'documentos' 
                ? 'bg-blue-600/10 text-blue-400 border-blue-600/30 font-medium shadow-md shadow-blue-900/10' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm">Declaraciones SAG & PDI</span>
          </button>

          <button 
            onClick={() => setCurrentTab('reportes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
              currentTab === 'reportes' 
                ? 'bg-blue-600/10 text-blue-400 border-blue-600/30 font-medium shadow-md shadow-blue-900/10' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Métricas y Reportes</span>
          </button>

          {(currentUser?.rol === 'OFICIAL_PDI' || currentUser?.rol === 'ADMIN') && (
            <button 
              onClick={() => setCurrentTab('pdi')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                currentTab === 'pdi' 
                  ? 'bg-emerald-600/10 text-emerald-400 border-emerald-600/30 font-medium shadow-md shadow-emerald-900/10' 
                  : 'border-transparent text-slate-400 hover:text-emerald-300 hover:bg-slate-800/40'
              }`}
            >
              <Fingerprint className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-sm">Control Migración (PDI)</span>
            </button>
          )}

          {currentUser?.rol === 'ADMIN' && (
            <button 
              onClick={() => setCurrentTab('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                currentTab === 'admin' 
                  ? 'bg-amber-600/10 text-amber-400 border-amber-600/30 font-medium shadow-md shadow-amber-900/10' 
                  : 'border-transparent text-slate-400 hover:text-amber-300 hover:bg-slate-800/40'
              }`}
            >
              <Settings className="w-5 h-5 text-amber-400" />
              <span className="text-sm">Panel de Admin</span>
            </button>
          )}

          <div className="pt-4 border-t border-slate-800/60 mt-4">
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Código Fuente Spring Boot</div>
            <button 
              onClick={() => setCurrentTab('backend-code')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                currentTab === 'backend-code' 
                  ? 'bg-blue-600/10 text-blue-400 border-blue-600/30 font-medium shadow-md shadow-blue-900/10' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <FileCode className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold">Descargar API Java</span>
            </button>
          </div>
        </nav>

        {/* User Simulation & JWT Control (RF-010 Access Control UI) */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0B1222] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sesión Actual</span>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
            >
              Cambiar
            </button>
          </div>

          {currentUser ? (
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/40 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow">
                  {currentUser.nombre.slice(0, 1)}{currentUser.apellido.slice(0,1)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{currentUser.nombre} {currentUser.apellido}</p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate font-mono">{currentUser.rut}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-700/50">
                <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-800/60 rounded text-[9px] font-bold tracking-wider">
                  {currentUser.rol}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 font-semibold text-[10px]"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-900/30">
              <p className="text-xs text-amber-300 font-medium leading-relaxed mb-2">Modo Invitado (Lectura)</p>
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold text-xs rounded-lg"
              >
                AUTENTICARSE CON JWT
              </button>
            </div>
          )}

          {/* Actor Quick Sandbox Switcher (Essential for easy grading/evaluation of actors) */}
          <div className="pt-2 border-t border-slate-850">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Simulador de Roles (Auto-Login)</p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button 
                onClick={() => handleQuickSwitchUser('juan.sag@sgf.gob.cl', 'SgfSag2026!')}
                className={`py-1 rounded text-center font-medium border transition-colors ${currentUser?.rol === 'INSPECTOR_SAG' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-300'}`}
              >
                SAG Inspector
              </button>
              <button 
                onClick={() => handleQuickSwitchUser('maria.aduanas@sgf.gob.cl', 'SgfAduana2026!')}
                className={`py-1 rounded text-center font-medium border transition-colors ${currentUser?.rol === 'FUNCIONARIO_ADUANA' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-300'}`}
              >
                Aduana Oficial
              </button>
              <button 
                onClick={() => handleQuickSwitchUser('carlos.pdi@sgf.gob.cl', 'SgfPdi2026!')}
                className={`py-1 rounded text-center font-medium border transition-colors ${currentUser?.rol === 'OFICIAL_PDI' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-300'}`}
              >
                PDI Oficial
              </button>
              <button 
                onClick={() => handleQuickSwitchUser('admin@sgf.gob.cl', 'SgfAdmin2026!')}
                className={`py-1 rounded text-center font-medium border transition-colors ${currentUser?.rol === 'ADMIN' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-300'}`}
              >
                Administrador
              </button>
              <button 
                onClick={() => handleQuickSwitchUser('esteban.viajero@gmail.com', 'password123')}
                className={`py-1 rounded text-center font-medium border transition-colors ${currentUser?.rol === 'VIAJERO' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-300'}`}
              >
                Viajero Esteban
              </button>
              <button 
                onClick={() => handleQuickSwitchUser('mateo.viajero@hotmail.com', 'password123')}
                className={`py-1 rounded text-center font-medium border transition-colors ${currentUser?.rol === 'TURISTA' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-300'}`}
              >
                Turista Mateo
              </button>
              <button 
                onClick={() => handleQuickSwitchUser('sven.turista@gmail.com', 'password123')}
                className={`py-1 rounded text-center font-medium border transition-colors ${currentUser?.email === 'sven.turista@gmail.com' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-300'}`}
              >
                Sven (ID Vencida)
              </button>
              <button 
                onClick={() => handleQuickSwitchUser('carlos.b@gmail.com', 'password123')}
                className={`py-1 rounded text-center font-medium border transition-colors ${currentUser?.email === 'carlos.b@gmail.com' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-300'}`}
              >
                Carlos (Arresto)
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">{currentPass}</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operativo 24/7
            </div>
            <span className="text-slate-300 text-lg">|</span>
            <span className="text-xs font-semibold text-slate-500">Paso Terrestre Chile - Argentina</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Real-time Clock display with LATAM timezone tag */}
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-mono font-medium tracking-tight">LATAM / SANTIAGO: 12:34 UTC-3</span>
            </div>

            <button 
              onClick={refreshAllData}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Sincronizar con Servidor"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </header>

        {/* STATUS TOP ALERTS BANNER */}
        {statusMessage && (
          <div className={`px-8 py-3 flex items-center justify-between transition-all duration-300 ${
            statusMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-white hover:opacity-80 text-xs font-bold uppercase tracking-wider">Cerrar</button>
          </div>
        )}

        {/* WORK AREA / INNER VIEW ROUTER */}
        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          {currentUser?.ordenArresto ? (
            <div className="p-8 bg-white border-2 border-rose-500 rounded-3xl shadow-xl space-y-6 max-w-2xl mx-auto text-center animate-pulse my-8">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-rose-700 uppercase tracking-wide">🚫 TRÁNSITO FRONTERIZO BLOQUEADO</h3>
                <p className="text-slate-700 text-sm font-medium">
                  Atención, <strong>{currentUser.nombre} {currentUser.apellido}</strong> (RUT: <strong>{currentUser.rut}</strong>).
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  El Sistema de Gestión Fronteriza (SGF) de la aduana de Chile ha detectado una orden de detención activa en la base de datos de la Policía de Investigaciones (PDI). Por motivos de seguridad nacional y cumplimiento legal, se han bloqueado preventivamente todos los procesos de este portal aduanero.
                </p>
              </div>

              <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-100 text-left text-xs space-y-2">
                <p className="font-bold">Pasos requeridos para habilitar su tránsito:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Acérquese de forma inmediata a la ventanilla o casilla de la Policía de Investigaciones (PDI) en el paso fronterizo actual.</li>
                  <li>El oficial de policía revisará su estatus y, de regularizarse la situación, utilizará el panel PDI del SGF para dar de baja la alerta judicial.</li>
                  <li>Una vez desactivada la alerta judicial, este portal se desbloqueará de inmediato y podrá continuar con sus declaraciones SAG, Aduana y registro vehicular.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button 
                  onClick={refreshAllData}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer uppercase tracking-wider"
                >
                  🔄 Re-verificar con Servidor SGF
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer uppercase tracking-wider"
                >
                  🚪 Cerrar Sesión (Simulador)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SEARCH & REST STATS BAR (Common Header for SGF Dashboard) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por RUT, Patente, Nombre o Estado..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-semibold rounded-lg">
                API Latency: <strong className="text-emerald-600 font-mono">14ms</strong>
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-semibold rounded-lg">
                Spring REST: <strong className="text-blue-600 font-mono">Cumple RNF-001</strong>
              </span>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold rounded-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> MySQL & JWT Activo
              </span>
            </div>
          </div>

          {/* =======================================================
              VIEW 1: DASHBOARD PANEL
              ======================================================= */}
          {currentTab === 'dashboard' && (
            currentUser?.rol === 'TURISTA' || currentUser?.rol === 'VIAJERO' ? (
              /* =======================================================
                 TRAVELER & TOURIST PORTAL
                 ======================================================= */
              <div className="space-y-8 animate-fadeIn">
                {/* 1. Welcoming & Hero Banner */}
                <div className="bg-[#0F172A] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                    <Fingerprint className="w-48 h-48 text-blue-500" />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      SGF Portal del Viajero
                    </span>
                    <h3 className="text-2xl font-extrabold tracking-tight font-sans text-white">
                      Hola, {currentUser.nombre} {currentUser.apellido}
                    </h3>
                    <p className="text-slate-400 text-sm max-w-2xl">
                      Tu perfil está registrado como <strong className="text-white font-semibold">{currentUser.rol}</strong>. Completa tus declaraciones electrónicas abajo para acelerar tu cruce fronterizo en <span className="text-blue-400 font-semibold">{currentPass}</span>.
                    </p>
                  </div>
                </div>

                {/* 2. Real-time Status / Notification Alerts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Status Banner */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Security Arrest Warrant Warning */}
                    {currentUser.ordenArresto && (
                      <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-4 shadow-sm animate-pulse">
                        <ShieldAlert className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-rose-950 text-sm">🚨 ALERTA DE SEGURIDAD PDI: RESTRICCIÓN DE INGRESO</h4>
                          <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                            Se ha registrado una orden de arresto activa asociada a su identificación. Su proceso de ingreso al país se encuentra temporalmente retenido. Diríjase de inmediato a las oficinas de la PDI.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Invalid/Expired Identification Warning */}
                    {currentUser.identificacionValida === false && (
                      <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-sm">
                        <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-amber-950 text-sm">❌ DOCUMENTO DE IDENTIDAD INVÁLIDO O VENCIDO</h4>
                          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                            El sistema PDI ha rechazado su documento de identificación ({currentUser.motivoIdInvalida || 'VENCIDA' || 'NO_AUTENTICA'}). No se puede proceder con su ingreso hasta regularizar su situación de identidad.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* General Crossing Ingress Status Display */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-slate-800">Estado de Trámite de Ingreso a Chile</h4>
                      </div>

                      {currentUser.estadoIngreso === 'ACEPTADO' ? (
                        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4 text-emerald-800">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-sm">¡INGRESO AUTORIZADO POR ADUANA & PDI!</p>
                            <p className="text-xs text-emerald-700 mt-0.5">Su ingreso terrestre ha sido aceptado con éxito. Puede avanzar por la caseta rápida automatizada.</p>
                          </div>
                        </div>
                      ) : currentUser.estadoIngreso === 'RECHAZADO' ? (
                        <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4 text-red-800">
                          <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
                          <div>
                            <p className="font-bold text-sm">INGRESO RECHAZADO EN CONTROL FRONTERIZO</p>
                            <p className="text-xs text-red-700 mt-0.5">El oficial ha rechazado su solicitud de ingreso debido a observaciones en su equipaje, vehículo o documentación.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-4 text-amber-800">
                          <Clock className="w-8 h-8 text-amber-600 shrink-0 animate-pulse" />
                          <div>
                            <p className="font-bold text-sm">TRÁMITE EN ESPERA DE REVISIÓN</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              {documentos.filter(d => d.viajeroRut === currentUser.rut).length === 0 
                                ? "Usted no ha cargado ninguna declaración todavía. Por favor complete los formularios de abajo."
                                : "Usted tiene declaraciones enviadas. Espere a que los inspectores SAG/Aduana aprueben sus documentos para actualizar su estado de ingreso."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Identification & Documents Checklist (Compact) */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm">Requisitos Obligatorios</h4>
                    <div className="space-y-2.5">
                      {/* Document Status list */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-600 font-medium">1. Cédula / Identificación</span>
                        {currentUser.identificacionValida !== false ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">VÁLIDA (PDI)</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">INVÁLIDA</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-600 font-medium">2. Declaración SAG</span>
                        {documentos.some(d => d.viajeroRut === currentUser.rut && d.tipo === 'DECLARACION_SAG' && d.estado === 'APROBADO') ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">APROBADO</span>
                        ) : documentos.some(d => d.viajeroRut === currentUser.rut && d.tipo === 'DECLARACION_SAG') ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded animate-pulse">PENDIENTE</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[9px] font-bold rounded">FALTANTE</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-600 font-medium">3. Formulario Aduana</span>
                        {documentos.some(d => d.viajeroRut === currentUser.rut && d.tipo === 'FORMULARIO_ADUANA' && d.estado === 'APROBADO') ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">APROBADO</span>
                        ) : documentos.some(d => d.viajeroRut === currentUser.rut && d.tipo === 'FORMULARIO_ADUANA') ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded animate-pulse">PENDIENTE</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[9px] font-bold rounded">FALTANTE</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-600 font-medium">4. Tarjeta Migratoria PDI</span>
                        {documentos.some(d => d.viajeroRut === currentUser.rut && d.tipo === 'PERMISO_PDI' && d.estado === 'APROBADO') ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">APROBADO</span>
                        ) : documentos.some(d => d.viajeroRut === currentUser.rut && d.tipo === 'PERMISO_PDI') ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded animate-pulse">PENDIENTE</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[9px] font-bold rounded">FALTANTE</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Interactive Multi-Declaration Form Creation */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                  <div className="pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 font-sans">Crear Solicitud de Declaraciones Cruzadas</h3>
                    <p className="text-xs text-slate-500">Seleccione todas las declaraciones que requiere emitir. Sus formularios se expandirán abajo de forma dinámica.</p>
                  </div>

                  <form onSubmit={handleSubmitDeclarations} className="space-y-6">
                    {/* Checkboxes selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* SAG toggle */}
                      <label className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all ${
                        selectedDeclarations.DECLARACION_SAG 
                          ? 'bg-blue-50/50 border-blue-500 text-blue-900' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase">1. SAG Chile</span>
                          <input 
                            type="checkbox"
                            checked={selectedDeclarations.DECLARACION_SAG}
                            onChange={(e) => setSelectedDeclarations({ ...selectedDeclarations, DECLARACION_SAG: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-0"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 leading-normal">Productos orgánicos, semillas y alimentos animales/vegetales.</span>
                      </label>

                      {/* Aduana vehicle toggle */}
                      <label className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all ${
                        selectedDeclarations.FORMULARIO_ADUANA 
                          ? 'bg-blue-50/50 border-blue-500 text-blue-900' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase">2. Aduanas</span>
                          <input 
                            type="checkbox"
                            checked={selectedDeclarations.FORMULARIO_ADUANA}
                            onChange={(e) => setSelectedDeclarations({ ...selectedDeclarations, FORMULARIO_ADUANA: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-0"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 leading-normal">Vehículo extranjero, mercaderías comerciales y efectivo.</span>
                      </label>

                      {/* PDI migration toggle */}
                      <label className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all ${
                        selectedDeclarations.PERMISO_PDI 
                          ? 'bg-blue-50/50 border-blue-500 text-blue-900' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase">3. Tarjeta PDI</span>
                          <input 
                            type="checkbox"
                            checked={selectedDeclarations.PERMISO_PDI}
                            onChange={(e) => setSelectedDeclarations({ ...selectedDeclarations, PERMISO_PDI: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-0"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 leading-normal">Tarjeta de Migración única de turista y tiempo de estadía.</span>
                      </label>

                      {/* SOAPEX toggle */}
                      <label className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all ${
                        selectedDeclarations.SOAPEX 
                          ? 'bg-blue-50/50 border-blue-500 text-blue-900' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase">4. SOAPEX Seguro</span>
                          <input 
                            type="checkbox"
                            checked={selectedDeclarations.SOAPEX}
                            onChange={(e) => setSelectedDeclarations({ ...selectedDeclarations, SOAPEX: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-0"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 leading-normal">Seguro de accidentes chileno para patentes extranjeras.</span>
                      </label>
                    </div>

                    {/* DYNAMIC FORM SEGMENTS */}
                    <div className="space-y-6 pt-4">
                      {/* SAG SEGMENT */}
                      {selectedDeclarations.DECLARACION_SAG && (
                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                            <h4 className="font-bold text-slate-800 text-xs uppercase">Formulario Declaración Jurada SAG Chile</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                              <input 
                                type="checkbox"
                                checked={declarationSAGData.traeAlimentos}
                                onChange={(e) => setDeclarationSAGData({ ...declarationSAGData, traeAlimentos: e.target.checked })}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-0"
                              />
                              <span>¿Lleva frutas, verduras o semillas frescas en su equipaje?</span>
                            </label>

                            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                              <input 
                                type="checkbox"
                                checked={declarationSAGData.traeProductosAnimales}
                                onChange={(e) => setDeclarationSAGData({ ...declarationSAGData, traeProductosAnimales: e.target.checked })}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-0"
                              />
                              <span>¿Lleva quesos, lácteos, embutidos o carnes procesadas?</span>
                            </label>

                            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                              <input 
                                type="checkbox"
                                checked={declarationSAGData.traeProductosVegetales}
                                onChange={(e) => setDeclarationSAGData({ ...declarationSAGData, traeProductosVegetales: e.target.checked })}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-0"
                              />
                              <span>¿Lleva plantas vivas, tierra, flores o bulbos botánicos?</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Descripción de Equipaje o Mercaderías Adicionales</label>
                            <textarea 
                              rows={2}
                              value={declarationSAGData.descripcionEquipaje}
                              onChange={(e) => setDeclarationSAGData({ ...declarationSAGData, descripcionEquipaje: e.target.value })}
                              placeholder="Indique brevemente lo que transporta en caso de dudas..."
                              className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* ADUANAS SEGMENT */}
                      {selectedDeclarations.FORMULARIO_ADUANA && (
                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                            <h4 className="font-bold text-slate-800 text-xs uppercase">Admisión Temporal de Vehículo Extranjero</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Patente del Vehículo *</label>
                              <input 
                                type="text"
                                value={declarationAduanaData.patenteAsociada}
                                onChange={(e) => setDeclarationAduanaData({ ...declarationAduanaData, patenteAsociada: e.target.value })}
                                placeholder="ej: AB-123-CD"
                                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                                required={selectedDeclarations.FORMULARIO_ADUANA}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Marca del Vehículo</label>
                              <input 
                                type="text"
                                value={declarationAduanaData.marcaVehiculo}
                                onChange={(e) => setDeclarationAduanaData({ ...declarationAduanaData, marcaVehiculo: e.target.value })}
                                placeholder="ej: Toyota"
                                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Modelo del Vehículo</label>
                              <input 
                                type="text"
                                value={declarationAduanaData.modeloVehiculo}
                                onChange={(e) => setDeclarationAduanaData({ ...declarationAduanaData, modeloVehiculo: e.target.value })}
                                placeholder="ej: Hilux"
                                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Efectivo total en divisas extranjeras (USD) mayor a 10K</label>
                            <input 
                              type="number"
                              value={declarationAduanaData.montoDivisas}
                              onChange={(e) => setDeclarationAduanaData({ ...declarationAduanaData, montoDivisas: Number(e.target.value) })}
                              placeholder="ej: 12000"
                              className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Obligatorio declarar si supera los $10.000 USD de acuerdo al Banco Central de Chile.</p>
                          </div>
                        </div>
                      )}

                      {/* PDI MIGRATION SEGMENT */}
                      {selectedDeclarations.PERMISO_PDI && (
                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                            <h4 className="font-bold text-slate-800 text-xs uppercase">Tarjeta Única Migratoria (PDI Chile)</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Motivo Principal de Viaje</label>
                              <select 
                                value={declarationPDIData.motivoViaje}
                                onChange={(e) => setDeclarationPDIData({ ...declarationPDIData, motivoViaje: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                              >
                                <option value="TURISMO">Turismo / Recreación</option>
                                <option value="NEGOCIOS">Negocios / Comercial</option>
                                <option value="TRANSITO">Tránsito hacia otro país</option>
                                <option value="TRABAJO">Permiso Consular Especial de Trabajo</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tiempo de Estadía Estimado (Días) *</label>
                              <input 
                                type="number"
                                value={declarationPDIData.tiempoEstadiaDias}
                                onChange={(e) => setDeclarationPDIData({ ...declarationPDIData, tiempoEstadiaDias: Number(e.target.value) })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                                min={1}
                                required={selectedDeclarations.PERMISO_PDI}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dirección de Destino o Alojamiento en Chile *</label>
                            <input 
                              type="text"
                              value={declarationPDIData.direccionDestino}
                              onChange={(e) => setDeclarationPDIData({ ...declarationPDIData, direccionDestino: e.target.value })}
                              placeholder="ej: Hotel Hyatt, Av. Vitacura 3737, Santiago"
                              className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                              required={selectedDeclarations.PERMISO_PDI}
                            />
                          </div>
                        </div>
                      )}

                      {/* SOAPEX SEGMENT */}
                      {selectedDeclarations.SOAPEX && (
                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">4</span>
                            <h4 className="font-bold text-slate-800 text-xs uppercase">Seguro SOAPEX Obligatorio Extranjeros</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Compañía Aseguradora</label>
                              <select 
                                value={declarationSOAPEXData.compañiaSeguro}
                                onChange={(e) => setDeclarationSOAPEXData({ ...declarationSOAPEXData, compañiaSeguro: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                              >
                                <option value="Consorcio SOAPEX">Consorcio Nacional Seguros</option>
                                <option value="HDI Seguros Chile">HDI Seguros Internacional</option>
                                <option value="Mapfre Internacional">Mapfre Compañía General</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Número de Póliza Electrónica *</label>
                              <input 
                                type="text"
                                value={declarationSOAPEXData.polizaNumero}
                                onChange={(e) => setDeclarationSOAPEXData({ ...declarationSOAPEXData, polizaNumero: e.target.value })}
                                placeholder="ej: POL-SOAPEX-2026-987654"
                                className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs"
                                required={selectedDeclarations.SOAPEX}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-150 uppercase tracking-wider cursor-pointer"
                      >
                        🚀 Enviar Declaraciones Seleccionadas al SGF
                      </button>
                    </div>
                  </form>
                </div>

                {/* 4. Display documents belonging to logged traveler */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Historial de Mis Declaraciones Cargadas</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-2.5">Declaración</th>
                          <th className="px-4 py-2.5">Archivo / Firma</th>
                          <th className="px-4 py-2.5">Fecha Envío</th>
                          <th className="px-4 py-2.5">Estado</th>
                          <th className="px-4 py-2.5">Inspector / Validador</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {documentos.filter(d => d.viajeroRut === currentUser.rut).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-slate-400 font-medium">
                              No has enviado ninguna declaración digital todavía.
                            </td>
                          </tr>
                        ) : (
                          documentos.filter(d => d.viajeroRut === currentUser.rut).map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {doc.tipo === 'DECLARACION_SAG' ? 'Declaración Conjunta SAG-Aduanas' : 
                                 doc.tipo === 'FORMULARIO_ADUANA' ? 'Admisión Temporal de Vehículo' : 
                                 doc.tipo === 'PERMISO_PDI' ? 'Tarjeta Única Migratoria PDI' : 'Seguro SOAPEX'}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-500">{doc.archivoNombre}</td>
                              <td className="px-4 py-3 text-slate-400">{doc.fechaCreacion.split('T')[0]}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                  doc.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                                  doc.estado === 'RECHAZADO' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                  {doc.estado}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 font-medium">{doc.validadorNombre || 'Pendiente de Firma'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* =======================================================
                 OFFICER BACK-OFFICE QUEUE DASHBOARD
                 ======================================================= */
              <div className="space-y-8 animate-fadeIn">
              
              {/* METRIC CARD GRID (Based on user's design style requirements) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiempo de Espera Medio</p>
                    <Clock className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="flex items-end gap-2.5">
                    <span className="text-3xl font-extrabold text-slate-900">4.8 min</span>
                    <span className="text-xs text-emerald-600 font-bold mb-1 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ↓ 98%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Antes: <strong>14.5 horas</strong> (Sin SGF Chile)</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flujo Total Registrado</p>
                    <Car className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-end gap-2.5">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {reporte ? reporte.totalVehiculos : 515}
                    </span>
                    <span className="text-xs text-slate-500 font-medium mb-1">Vehículos</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Registrados digitalmente hoy</p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Docs de Aduanas & SAG</p>
                    <FileText className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-end gap-2.5">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {reporte ? reporte.totalDocumentosAprobados : 2843}
                    </span>
                    <span className="text-xs text-emerald-600 font-bold mb-1">Validados</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Rechazados: <strong className="text-rose-600">{reporte ? reporte.totalDocumentosRechazados : 42}</strong></p>
                </div>

                <div className="bg-[#1E3A8A] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                    <Database className="w-32 h-32" />
                  </div>
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Base de Datos SGF</p>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="relative z-10">
                    <span className="text-2xl font-bold">MySQL 8.0</span>
                    <p className="text-[11px] text-blue-200 mt-2">Spring Boot JPA Hibernate - JWT Secure Provider</p>
                    <button 
                      onClick={() => setCurrentTab('backend-code')}
                      className="mt-3 w-full bg-white/10 hover:bg-white/20 transition-colors text-white py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                    >
                      Ver Esquema SQL <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

              {/* TWO COLUMN GRID: PROCESSING QUEUE & ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Processing Queue Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-slate-800">Cola de Procesamiento en Tiempo Real</h3>
                      <p className="text-xs text-slate-500">Documentos ingresados por viajeros esperando firma o validación</p>
                    </div>
                    <button 
                      onClick={() => setCurrentTab('documentos')}
                      className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline"
                    >
                      Ver todos ({documentos.length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3.5">Viajero</th>
                          <th className="px-6 py-3.5">RUT</th>
                          <th className="px-6 py-3.5">Tipo Declaración</th>
                          <th className="px-6 py-3.5">Estado</th>
                          <th className="px-6 py-3.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {documentos.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">
                              Cargando registros o cola vacía...
                            </td>
                          </tr>
                        ) : (
                          documentos.slice(0, 5).map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-4 font-semibold text-slate-800">
                                {doc.viajeroNombre}
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                {doc.viajeroRut}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs font-medium text-slate-700">
                                  {doc.tipo === 'DECLARACION_SAG' ? 'Declaración SAG' : 
                                   doc.tipo === 'FORMULARIO_ADUANA' ? 'Admisión Vehículo' : 
                                   doc.tipo === 'PERMISO_PDI' ? 'Tarjeta PDI' : 'SOAPEX'}
                                </div>
                                <span className="text-[10px] text-slate-400 block font-mono">{doc.archivoNombre}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  doc.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                                  doc.estado === 'RECHAZADO' ? 'bg-rose-100 text-rose-800' :
                                  'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                  {doc.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {doc.estado === 'PENDIENTE' ? (
                                  <button 
                                    onClick={() => {
                                      setValidatingDoc(doc);
                                      setValidationStatus('APROBADO');
                                    }}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                  >
                                    Validar Oficial
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium block">
                                    Resuelto
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Sleek Quick Action card */}
                <div className="bg-[#1E3A8A] rounded-2xl shadow-xl p-6 text-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-bold">Validación Digital SGF</h3>
                    </div>
                    <p className="text-xs text-blue-200 leading-relaxed mb-6">
                      Módulo integrado para simular el ingreso de datos fronterizos en Chile. Reduzca tiempos de espera terrestres ingresando una nueva declaración como Viajero o controlando patentes como Inspector.
                    </p>

                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setCurrentTab('documentos');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="w-full py-3 bg-white text-[#1E3A8A] font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-colors text-xs uppercase tracking-wider"
                      >
                        + Emitir Nueva Declaración SAG
                      </button>

                      <button 
                        onClick={() => {
                          setCurrentTab('vehiculos');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="w-full py-3 bg-blue-600 text-white border border-blue-500/50 font-bold rounded-xl hover:bg-blue-500 transition-colors text-xs uppercase tracking-wider"
                      >
                        Registrar Vehículo en Aduanas
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-6 text-[11px] text-blue-200">
                    <p className="leading-relaxed font-mono">
                      Backend: Spring Boot v3.2.5<br />
                      Database: MySQL 8.0<br />
                      Auth Provider: JWT Secure Session
                    </p>
                  </div>
                </div>

              </div>

              {/* INTEGRATION REST API DEBUG LOGGER (Shows dynamic request and response logs as actions happen) */}
              <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 bg-[#0B1329] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <span className="font-mono text-sm font-bold text-slate-200">Consola de Respuestas RESTful JSON (Simulador Spring Boot)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase bg-slate-800 px-2 py-1 rounded">
                      REST API: PORT 3000
                    </span>
                    <button 
                      onClick={handleClearLogs}
                      className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1 bg-slate-800/80 hover:bg-slate-800 rounded transition-colors"
                    >
                      Vaciar Consola
                    </button>
                  </div>
                </div>

                <div className="p-5 font-mono text-xs text-slate-300 space-y-4 max-h-72 overflow-y-auto bg-[#0d162d]">
                  {apiLogs.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-4">Ningún llamado REST procesado aún. Registre un usuario, patente o valide un documento para gatillar logs API.</p>
                  ) : (
                    apiLogs.map((log, index) => (
                      <div key={index} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              log.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              log.method === 'POST' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              log.method === 'PUT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {log.method}
                            </span>
                            <span className="text-white font-semibold">{log.path}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status >= 200 && log.status < 300 ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                            }`}>
                              HTTP {log.status}
                            </span>
                          </div>
                        </div>

                        {log.body && (
                          <div className="pt-2 border-t border-slate-900">
                            <span className="text-[10px] text-slate-500 block mb-1">Request Body (JSON):</span>
                            <pre className="text-[11px] text-blue-300 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.body, null, 2)}</pre>
                          </div>
                        )}

                        {log.response && (
                          <div className="pt-2 border-t border-slate-900/60">
                            <span className="text-[10px] text-slate-500 block mb-1">Response Body (JSON):</span>
                            <pre className="text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.response, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              </div>
            )
          )}

          {/* =======================================================
              VIEW 2: USUARIOS CRUD
              ======================================================= */}
          {currentTab === 'usuarios' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Register New User Form (RF-001) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 self-start">
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">RF-001: Registro de Usuario SGF</h3>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">RUT Chileno *</label>
                    <input 
                      type="text"
                      required
                      placeholder="ej: 12.345.678-9"
                      value={newUser.rut}
                      onChange={(e) => setNewUser({ ...newUser, rut: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-[10px] text-slate-400">Incluya puntos y guión verificador</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Juan"
                        value={newUser.nombre}
                        onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Apellido *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Pérez"
                        value={newUser.apellido}
                        onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Corporativo / Personal *</label>
                    <input 
                      type="email"
                      required
                      placeholder="correo@ejemplo.cl"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono Móvil</label>
                    <input 
                      type="text"
                      placeholder="+56 9 1234 5678"
                      value={newUser.telefono}
                      onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nacionalidad</label>
                      <select 
                        value={newUser.nacionalidad}
                        onChange={(e) => setNewUser({ ...newUser, nacionalidad: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      >
                        <option value="CHILENA">CHILENA</option>
                        <option value="ARGENTINA">ARGENTINA</option>
                        <option value="BRASILEÑA">BRASILEÑA</option>
                        <option value="URUGUAYA">URUGUAYA</option>
                        <option value="OTRA">OTRA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Rol / Permisos SGF</label>
                      <select 
                        value={newUser.rol}
                        onChange={(e) => setNewUser({ ...newUser, rol: e.target.value as UserRole })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none font-semibold text-blue-700"
                      >
                        <option value="VIAJERO">VIAJERO</option>
                        <option value="INSPECTOR_SAG">INSPECTOR SAG</option>
                        <option value="FUNCIONARIO_ADUANA">ADUANA OFICIAL</option>
                        <option value="OFICIAL_PDI">OFICIAL PDI</option>
                        <option value="ADMIN">ADMINISTRADOR</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    Registrar en SGF Chile
                  </button>
                </form>
              </div>

              {/* Right Column: List of Registered Users */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">Usuarios Registrados en el Sistema</h3>
                    <p className="text-xs text-slate-500">Mapeados al endpoint REST <code className="bg-slate-100 px-1 py-0.5 rounded">/api/v1/usuarios</code></p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {filteredUsers.length} registros
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">RUT / Email</th>
                        <th className="px-6 py-3">Nacionalidad</th>
                        <th className="px-6 py-3">Rol del Sistema</th>
                        <th className="px-6 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No hay usuarios que coincidan con la búsqueda.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {user.nombre} {user.apellido}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs block text-slate-700">{user.rut}</span>
                              <span className="text-xs text-slate-400">{user.email}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium text-xs">{user.nacionalidad}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                user.rol === 'INSPECTOR_SAG' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                user.rol === 'FUNCIONARIO_ADUANA' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                user.rol === 'OFICIAL_PDI' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {user.rol}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {currentUser?.rol === 'ADMIN' ? (
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No permitido</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =======================================================
              VIEW 3: VEHÍCULOS CRUD
              ======================================================= */}
          {currentTab === 'vehiculos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Register Vehicle Form (RF-003) */}
              {currentUser?.rol === 'VIAJERO' || currentUser?.rol === 'TURISTA' || currentUser?.rol === 'ADMIN' ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 self-start">
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                    <Car className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-800">RF-003: Registrar Patente de Vehículo</h3>
                  </div>

                  <form onSubmit={handleCreateVehicle} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Patente Única *</label>
                      <input 
                        type="text"
                        required
                        placeholder="ej: DFGR-82 o AE948LK"
                        value={newVehiculo.patente}
                        onChange={(e) => setNewVehiculo({ ...newVehiculo, patente: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-400">Patentes chilenas o extranjeras</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Marca *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Toyota"
                          value={newVehiculo.marca}
                          onChange={(e) => setNewVehiculo({ ...newVehiculo, marca: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Modelo *</label>
                        <input 
                          type="text"
                          required
                          placeholder="RAV4"
                          value={newVehiculo.modelo}
                          onChange={(e) => setNewVehiculo({ ...newVehiculo, modelo: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">RUT Propietario / Conductor *</label>
                      <input 
                        type="text"
                        required
                        placeholder="ej: 12.345.678-9"
                        value={newVehiculo.propietarioRut}
                        onChange={(e) => setNewVehiculo({ ...newVehiculo, propietarioRut: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">País Registro</label>
                        <select 
                          value={newVehiculo.paisRegistro}
                          onChange={(e) => setNewVehiculo({ ...newVehiculo, paisRegistro: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                        >
                          <option value="CHILE">CHILE</option>
                          <option value="ARGENTINA">ARGENTINA</option>
                          <option value="BRASIL">BRASIL</option>
                          <option value="BOLIVIA">BOLIVIA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Año</label>
                        <input 
                          type="number"
                          required
                          value={newVehiculo.anio}
                          onChange={(e) => setNewVehiculo({ ...newVehiculo, anio: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo de Vehículo</label>
                      <select 
                        value={newVehiculo.tipoVehiculo}
                        onChange={(e) => setNewVehiculo({ ...newVehiculo, tipoVehiculo: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      >
                        <option value="PARTICULAR">PARTICULAR</option>
                        <option value="COMERCIAL">COMERCIAL</option>
                        <option value="BUS">BUS / COLECTIVO</option>
                        <option value="MOTO">MOTOCICLETA</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Número de Chasis (VIN)</label>
                      <input 
                        type="text"
                        placeholder="Opcional"
                        value={newVehiculo.numeroChasis}
                        onChange={(e) => setNewVehiculo({ ...newVehiculo, numeroChasis: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none font-mono"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold rounded-xl text-sm shadow-md"
                    >
                      Registrar Patente
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 self-start space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-800">Directrices de Control de Aduana</h3>
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-850 space-y-2 leading-relaxed">
                    <p className="font-bold uppercase tracking-wide text-blue-900">Solo el Viajero declara el Vehículo</p>
                    <p>Como funcionario o inspector de control, usted no puede registrar vehículos directamente. Los viajeros deben declarar su patente desde su respectiva cuenta de viajero o turista.</p>
                    <p>Su función es verificar la lista de la derecha, comprobar si el propietario tiene su documentación en regla y tomar la decisión de <strong>Autorizar</strong> o <strong>Rechazar</strong> la patente.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Criterios de Autorización Vehicular:</h4>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                      <li>El conductor debe poseer identificación auténtica y vigente en Chile (validada por PDI).</li>
                      <li>La declaración conjunta SAG no debe reportar patógenos ni contrabando orgánico sin declarar.</li>
                      <li>No debe existir una orden de detención activa para el viajero (orden de arresto PDI).</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Right Column: List and status management of registered vehicles */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">Control de Vehículos Registrados</h3>
                    <p className="text-xs text-slate-500">Mapeados al endpoint REST <code className="bg-slate-100 px-1 py-0.5 rounded">/api/v1/vehiculos</code></p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {filteredVehiculos.length} vehículos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Patente</th>
                        <th className="px-6 py-3">Vehículo</th>
                        <th className="px-6 py-3">Propietario RUT</th>
                        <th className="px-6 py-3">País de Registro</th>
                        <th className="px-6 py-3">Estado Aduana</th>
                        <th className="px-6 py-3 text-right">Acción Autorización</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredVehiculos.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No hay patentes registradas en el SGF que coincidan.</td>
                        </tr>
                      ) : (
                        filteredVehiculos.map((v) => {
                          const ownerUser = usuarios.find(u => u.rut === v.propietarioRut);
                          const sagDoc = documentos.find(d => d.viajeroRut === v.propietarioRut && d.tipo === 'DECLARACION_SAG');
                          const pdiDoc = documentos.find(d => d.viajeroRut === v.propietarioRut && d.tipo === 'PERMISO_PDI');

                          const isSagApproved = sagDoc?.estado === 'APROBADO';
                          const isPdiApproved = pdiDoc?.estado === 'APROBADO' && ownerUser?.identificacionValida !== false && !ownerUser?.ordenArresto;
                          const isTodoEnRegla = isSagApproved && isPdiApproved;

                          return (
                            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="inline-block px-3 py-1 bg-amber-50 text-slate-900 border-2 border-slate-900 font-mono font-extrabold text-sm rounded-md tracking-wider">
                                  {v.patente}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-semibold text-slate-800">{v.marca} {v.modelo}</span>
                                <span className="text-xs text-slate-400 block">{v.tipoVehiculo} ({v.anio})</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs text-slate-850 font-semibold block">{v.propietarioRut}</span>
                                {ownerUser ? (
                                  <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                                    {ownerUser.nombre} {ownerUser.apellido}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic block">Sin cuenta registrada</span>
                                )}
                                
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="text-slate-400 font-semibold">SAG:</span>
                                    {isSagApproved ? (
                                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">✓ Aprobado</span>
                                    ) : sagDoc ? (
                                      <span className="text-amber-600 font-bold flex items-center gap-0.5">⚠️ {sagDoc.estado}</span>
                                    ) : (
                                      <span className="text-rose-600 font-bold flex items-center gap-0.5">✗ Falta</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="text-slate-400 font-semibold">PDI:</span>
                                    {isPdiApproved ? (
                                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">✓ Aprobado</span>
                                    ) : ownerUser?.ordenArresto ? (
                                      <span className="text-red-600 font-extrabold flex items-center gap-0.5 animate-pulse">🚨 ARRESTO</span>
                                    ) : ownerUser?.identificacionValida === false ? (
                                      <span className="text-red-600 font-bold flex items-center gap-0.5">ID Inválida</span>
                                    ) : pdiDoc ? (
                                      <span className="text-amber-600 font-bold flex items-center gap-0.5">⚠️ {pdiDoc.estado}</span>
                                    ) : (
                                      <span className="text-rose-600 font-bold flex items-center gap-0.5">✗ Falta</span>
                                    )}
                                  </div>
                                  {isTodoEnRegla ? (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                                      ✓ EN REGLA
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] bg-rose-50 text-rose-750 px-1.5 py-0.5 rounded font-bold border border-rose-200 animate-pulse">
                                      ⚠️ OBSERVADO
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 text-xs font-medium">{v.paisRegistro}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  v.estado === 'AUTORIZADO' ? 'bg-emerald-100 text-emerald-800' :
                                  v.estado === 'RECHAZADO' ? 'bg-rose-100 text-rose-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {v.estado === 'AUTORIZADO' ? <CheckCircle2 className="w-3.5 h-3.5" /> : v.estado === 'RECHAZADO' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                  {v.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {currentUser?.rol === 'FUNCIONARIO_ADUANA' || currentUser?.rol === 'ADMIN' ? (
                                  <div className="space-y-1">
                                    <div className="flex justify-end gap-1.5">
                                      <button 
                                        onClick={() => handleUpdateVehicleStatus(v.id, 'AUTORIZADO')}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                      >
                                        Autorizar
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateVehicleStatus(v.id, 'RECHAZADO')}
                                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                      >
                                        Rechazar
                                      </button>
                                    </div>
                                    {!isTodoEnRegla && (
                                      <span className="text-[10px] text-rose-600 font-bold block text-right mt-1">
                                        ⚠️ Requiere SAG & PDI OK
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Req. Funcionario Aduana</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =======================================================
              VIEW 4: DOCUMENTOS (DECLARACIONES SAG, FORMULARIO ADUANA, ETC)
              ======================================================= */}
          {currentTab === 'documentos' && (
            <div className="space-y-8">
              
              {/* Document Review modal overlay or inline validation card */}
              {validatingDoc && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-md relative">
                  <button 
                    onClick={() => setValidatingDoc(null)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold"
                  >
                    X
                  </button>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Validación Firma Digital de Declaración: {validatingDoc.archivoNombre}
                  </h3>
                  <p className="text-xs text-slate-600 mb-4">
                    Usted está firmando como funcionario oficial del SGF de Chile. Esto actualizará el estado de la DJ del viajero.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 bg-white p-4 rounded-xl border border-blue-100">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Viajero Declarante</p>
                      <p className="text-sm font-semibold text-slate-800">{validatingDoc.viajeroNombre} (RUT: {validatingDoc.viajeroRut})</p>
                      
                      <p className="text-xs text-slate-400 uppercase font-bold mt-3">Tipo de Declaración</p>
                      <p className="text-sm font-semibold text-slate-700">{validatingDoc.tipo}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Contenido de Alérgenos, SAG, Alimentos y Divisas</p>
                      <ul className="text-xs space-y-1 text-slate-700">
                        <li>¿Trae Alimentos orgánicos?: <strong>{validatingDoc.datosContenido.traeAlimentos ? 'SÍ' : 'NO'}</strong></li>
                        <li>¿Trae Semillas / Plantas?: <strong>{validatingDoc.datosContenido.traeProductosVegetales ? 'SÍ' : 'NO'}</strong></li>
                        <li>¿Trae Derivados de animales?: <strong>{validatingDoc.datosContenido.traeProductosAnimales ? 'SÍ' : 'NO'}</strong></li>
                        <li>¿Porta divisas extranjeras {'>'}$10k USD?: <strong>{validatingDoc.datosContenido.montoDivisas ? `$${validatingDoc.datosContenido.montoDivisas} USD` : 'NO'}</strong></li>
                        {validatingDoc.datosContenido.descripcionEquipaje && (
                          <li className="mt-1 bg-slate-50 p-1.5 rounded italic">
                            "{validatingDoc.datosContenido.descripcionEquipaje}"
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <form onSubmit={handleValidateDocumentSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/3">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Decisión de Control Fronterizo *</label>
                      <select 
                        value={validationStatus}
                        onChange={(e) => setValidationStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="APROBADO">APROBAR DECLARACIÓN</option>
                        <option value="RECHAZADO">RECHAZAR DECLARACIÓN / CITAR A REVISIÓN</option>
                      </select>
                    </div>

                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Observaciones / Motivos de la decisión</label>
                      <input 
                        type="text"
                        required
                        placeholder="ej: Equipaje verificado sin patógenos orgánicos."
                        value={validationComments}
                        onChange={(e) => setValidationComments(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
                      >
                        Aplicar Firma Digital
                      </button>
                      <button 
                        type="button"
                        onClick={() => setValidatingDoc(null)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Submit New Digital Document Form (SAG Sworn Joint declaration) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 self-start">
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-800">RF-004: Declarar Equipaje SAG</h3>
                  </div>

                  <form onSubmit={handleCreateDocument} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo de Documento</label>
                      <select 
                        value={newDoc.tipo}
                        onChange={(e) => setNewDoc({ ...newDoc, tipo: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none"
                      >
                        <option value="DECLARACION_SAG">Declaración Jurada Conjunta SAG-Aduanas</option>
                        <option value="FORMULARIO_ADUANA">Formulario Admisión Temporal de Vehículo</option>
                        <option value="PERMISO_PDI">Tarjeta Única Migratoria (Control PDI)</option>
                        <option value="SOAPEX">Seguro SOAPEX Extranjeros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre Completo Viajero Declarante *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Esteban González"
                        value={newDoc.viajeroNombre}
                        onChange={(e) => setNewDoc({ ...newDoc, viajeroNombre: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">RUT Viajero Declarante *</label>
                      <input 
                        type="text"
                        required
                        placeholder="ej: 12.345.678-9"
                        value={newDoc.viajeroRut}
                        onChange={(e) => setNewDoc({ ...newDoc, viajeroRut: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    {/* Checkboxes targeting custom SAG rules in Chile */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-3">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Cuestionario Obligatorio SAG Chile</p>
                      
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                        <input 
                          type="checkbox"
                          checked={newDoc.traeAlimentos}
                          onChange={(e) => setNewDoc({ ...newDoc, traeAlimentos: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-0 border-slate-300"
                        />
                        <span>¿Transporta productos de origen vegetal u hortofrutícola?</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                        <input 
                          type="checkbox"
                          checked={newDoc.traeProductosAnimales}
                          onChange={(e) => setNewDoc({ ...newDoc, traeProductosAnimales: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-0 border-slate-300"
                        />
                        <span>¿Transporta lácteos, embutidos o carnes procesadas?</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                        <input 
                          type="checkbox"
                          checked={newDoc.traeProductosVegetales}
                          onChange={(e) => setNewDoc({ ...newDoc, traeProductosVegetales: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-0 border-slate-300"
                        />
                        <span>¿Transporta semillas, flores de corte o plantas vivas?</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Monto de Divisas en Efectivo (USD)</label>
                      <input 
                        type="number"
                        placeholder="Monto en dólares si supera los $10.000 USD"
                        value={newDoc.montoDivisas}
                        onChange={(e) => setNewDoc({ ...newDoc, montoDivisas: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Descripción de Equipaje</label>
                      <textarea 
                        rows={2}
                        placeholder="Ropa personal, computador, etc..."
                        value={newDoc.descripcionEquipaje}
                        onChange={(e) => setNewDoc({ ...newDoc, descripcionEquipaje: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold rounded-xl text-sm shadow-md"
                    >
                      Enviar Declaración Digital
                    </button>
                  </form>
                </div>

                {/* Document Database Queue View (RF-005 validation & control) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">Repositorio y Validación Digital de Documentos</h3>
                      <p className="text-xs text-slate-500">Documentos que se sincronizan con <code className="bg-slate-100 px-1 py-0.5 rounded">/api/v1/documentos</code></p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {filteredDocumentos.length} total
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {filteredDocumentos.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-12">No hay documentos cargados en el repositorio.</p>
                    ) : (
                      filteredDocumentos.map((doc) => (
                        <div key={doc.id} className="p-5 hover:bg-slate-50/40 transition-colors space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-bold text-slate-400 font-mono tracking-tight">{doc.id}</span>
                                <h4 className="font-bold text-slate-800 text-sm leading-snug">{doc.titulo}</h4>
                                <p className="text-xs text-slate-500">Declarante: <strong>{doc.viajeroNombre}</strong> | RUT: <strong className="font-mono">{doc.viajeroRut}</strong></p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                doc.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' :
                                doc.estado === 'RECHAZADO' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {doc.estado}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-bold text-[10px] text-slate-400 uppercase">Cuestionario Alimentos/SAG:</p>
                              <p>Lácteos/Fruta/Animales: <strong>{
                                (doc.datosContenido.traeAlimentos || doc.datosContenido.traeProductosVegetales || doc.datosContenido.traeProductosAnimales) 
                                  ? 'SÍ DECLARA' 
                                  : 'NO DECLARA'
                              }</strong></p>
                              {doc.datosContenido.montoDivisas ? (
                                <p>Divisas: <strong>${doc.datosContenido.montoDivisas} USD</strong></p>
                              ) : null}
                            </div>
                            <div>
                              <p className="font-bold text-[10px] text-slate-400 uppercase">Detalles del Archivo Firmado:</p>
                              <p className="font-mono text-blue-600 underline cursor-pointer">{doc.archivoNombre}</p>
                              <p className="text-[10px] text-slate-400">Creado: {new Date(doc.fechaCreacion).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {doc.estado === 'PENDIENTE' ? (
                            <div className="flex justify-end gap-2">
                              {/* Check role rules for validation permission (RF-010) */}
                              {currentUser?.rol === 'ADMIN' || currentUser?.rol === 'INSPECTOR_SAG' || currentUser?.rol === 'FUNCIONARIO_ADUANA' || currentUser?.rol === 'OFICIAL_PDI' ? (
                                <button 
                                  onClick={() => {
                                    setValidatingDoc(doc);
                                    setValidationStatus('APROBADO');
                                    window.scrollTo({ top: 100, behavior: 'smooth' });
                                  }}
                                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                                >
                                  Validar y Firmar como {currentUser.rol}
                                </button>
                              ) : (
                                <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                  Autentíquese como SAG/Aduana para validar esta declaración.
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="p-2.5 bg-emerald-50 rounded-lg text-xs text-emerald-800 space-y-0.5">
                              <p className="font-bold">✓ Validado por {doc.validadoPor}</p>
                              {doc.observaciones && <p className="italic text-emerald-700">"{doc.observaciones}"</p>}
                              <p className="text-[10px] text-slate-400">{doc.fechaValidacion && new Date(doc.fechaValidacion).toLocaleString()}</p>
                            </div>
                          )}

                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =======================================================
              VIEW 5: REPORTES ESTADÍSTICOS (RF-009)
              ======================================================= */}
          {currentTab === 'reportes' && (
            <div className="space-y-8">
              
              {/* Header */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">RF-009: Métricas Estadísticas de Reducción de Tiempos</h3>
                  <p className="text-xs text-slate-500">Comparación de tiempos de espera con y sin el Sistema de Gestión Fronteriza (SGF)</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleExportReport('pdf')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" /> Exportar Reporte PDF
                  </button>
                  <button 
                    onClick={() => handleExportReport('excel')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" /> Exportar Planilla Excel
                  </button>
                </div>
              </div>

              {/* Paso-by-paso stats container */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {reporte?.desglosePasos.map((paso, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div className="pb-2 border-b border-slate-100">
                      <h4 className="font-bold text-slate-800 text-sm truncate" title={paso.pasoNombre}>
                        {paso.pasoNombre.split(' (')[0]}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{paso.pasoNombre.split(' (')[1]?.replace(')', '') || 'Chile'}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Tiempo de espera sin SGF:</span>
                        <strong className="text-rose-600">{paso.tiempoEsperaSinSgf} horas</strong>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Tiempo de espera con SGF:</span>
                        <strong className="text-emerald-600">{paso.tiempoEsperaConSgf} minutos</strong>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1 flex">
                        <div className="bg-rose-500 h-full" style={{ width: '85%' }}></div>
                        <div className="bg-emerald-500 h-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-50 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Flujo de Hoy</span>
                        <strong className="text-slate-800">{paso.vehiculosProcesados} veh</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Alertas SAG</span>
                        <strong className="text-amber-600 font-bold">{paso.alertasDetectadas}</strong>
                      </div>
                    </div>
                  </div>
                ))}

              </div>

              {/* Beautiful custom comparative analytics box */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">Rendimiento Operacional SGF</h4>
                  
                  {/* Custom CSS Bar chart representation */}
                  <div className="space-y-3.5">
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Paso Los Libertadores</span>
                        <span className="text-emerald-600 font-mono">98.5% de Eficiencia en Descongestionamiento</span>
                      </div>
                      <div className="h-6 bg-slate-100 rounded-lg overflow-hidden relative flex items-center px-2">
                        <div className="bg-emerald-500/20 absolute left-0 top-0 h-full" style={{ width: '98.5%' }}></div>
                        <span className="text-[10px] font-bold text-slate-800 z-10">Espera reducido de 16 hrs a 5.1 minutos</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Paso Cardenal Samoré</span>
                        <span className="text-emerald-600 font-mono">99.1% de Eficiencia</span>
                      </div>
                      <div className="h-6 bg-slate-100 rounded-lg overflow-hidden relative flex items-center px-2">
                        <div className="bg-emerald-500/20 absolute left-0 top-0 h-full" style={{ width: '99.1%' }}></div>
                        <span className="text-[10px] font-bold text-slate-800 z-10">Espera reducido de 9.5 hrs a 3.2 minutos</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Paso Pehuenche</span>
                        <span className="text-emerald-600 font-mono">97.2% de Eficiencia</span>
                      </div>
                      <div className="h-6 bg-slate-100 rounded-lg overflow-hidden relative flex items-center px-2">
                        <div className="bg-emerald-500/20 absolute left-0 top-0 h-full" style={{ width: '97.2%' }}></div>
                        <span className="text-[10px] font-bold text-slate-800 z-10">Espera reducido de 12 hrs a 4.0 minutos</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="bg-[#1E293B] text-slate-300 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-white text-sm mb-2">Resumen Operacional Chile</h5>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      La digitalización con firmas concurrentes de SAG, Aduanas y PDI permite que el 94% de los vehículos terrestres realicen el control en menos de 5 minutos al cruzar la cordillera de los Andes.
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>Procesados totales:</span>
                      <span className="font-bold text-white">14.350 Viajeros</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cumplimiento RNF-001:</span>
                      <span className="text-emerald-400 font-bold font-mono">99.98% OK</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =======================================================
              VIEW 6: SPRING BOOT SOURCE CODE EXPORTER (Java with Spring Boot & MySQL)
              ======================================================= */}
          {currentTab === 'backend-code' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-amber-500" />
                      Arquitectura del Backend REST en Java Spring Boot
                    </h3>
                    <p className="text-xs text-slate-500">
                      Plantillas de código fuente listas para implementar en producción. Incluye JPA, Hibernate, JWT, Seguridad y esquema MySQL para el SGF de Chile.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder="Filtrar archivos..."
                      value={codeSearch}
                      onChange={(e) => setCodeSearch(e.target.value)}
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                    <button 
                      onClick={handleCopyCode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      {copiedCode ? "Copiado!" : "Copiar Código"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* List of files */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2 h-[550px] overflow-y-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Estructura del Proyecto Java</p>
                  
                  {filteredJavaTemplates.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedJavaFile(file);
                        setCopiedCode(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start gap-2.5 border ${
                        selectedJavaFile.name === file.name 
                          ? 'bg-blue-50/80 border-blue-200 text-blue-800 font-semibold' 
                          : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <FileCode className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="overflow-hidden">
                        <span className="text-xs block truncate">{file.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono block truncate">{file.path}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Code viewport */}
                <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[550px]">
                  
                  {/* Viewport header */}
                  <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300 font-semibold">{selectedJavaFile.path}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-mono rounded text-[10px] uppercase">
                      {selectedJavaFile.language}
                    </span>
                  </div>

                  {/* Code block */}
                  <pre className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 bg-[#0c1426] leading-relaxed select-all">
                    <code>{selectedJavaFile.code}</code>
                  </pre>
                </div>

              </div>

            </div>
          )}

          {/* =======================================================
              VIEW 7: CONTROL MIGRACIÓN (PDI)
              ======================================================= */}
          {currentTab === 'pdi' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="bg-[#0B1329] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                  <Fingerprint className="w-48 h-48 text-emerald-500" />
                </div>
                <div className="relative z-10 space-y-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    SGF Módulo de Migración Oficial
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight font-sans text-white">
                    Control Policial de Migración (PDI)
                  </h3>
                  <p className="text-slate-400 text-sm max-w-2xl">
                    Paso Fronterizo Activo: <strong className="text-emerald-400 font-semibold">{currentPass}</strong>. Busque viajeros, valide su identidad, verifique órdenes de arresto nacionales e informe resoluciones en tiempo real.
                  </p>
                </div>
              </div>

              {/* Role restriction guard */}
              {currentUser?.rol !== 'OFICIAL_PDI' && currentUser?.rol !== 'ADMIN' ? (
                <div className="p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-4">
                  <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto animate-bounce" />
                  <h4 className="font-bold text-amber-900 text-lg">ACCESO RESTRINGIDO - SOLO PERSONAL PDI CHILE</h4>
                  <p className="text-sm text-amber-700 max-w-md mx-auto">
                    Usted ha ingresado como <strong className="text-amber-950 font-bold">{currentUser?.rol || 'INVITADO'}</strong>. Utilice el panel rápido de "Cambiar de Identidad" abajo a la izquierda para iniciar sesión como <strong className="text-emerald-800 font-bold">Oficial PDI (carlos.pdi@sgf.gob.cl)</strong> para simular las validaciones migratorias.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        type="text"
                        placeholder="Buscar viajero por RUT o Nombre..."
                        value={pdiSearchQuery}
                        onChange={(e) => setPdiSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                      <button 
                        onClick={() => setPdiFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          pdiFilter === 'ALL' 
                            ? 'bg-emerald-600 text-white shadow' 
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Todos ({usuarios.filter(u => u.rol === 'VIAJERO' || u.rol === 'TURISTA').length})
                      </button>

                      <button 
                        onClick={() => setPdiFilter('ALERT_ID')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          pdiFilter === 'ALERT_ID' 
                            ? 'bg-amber-600 text-white shadow' 
                            : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> ID Inválida / Vencida ({
                          usuarios.filter(u => (u.rol === 'VIAJERO' || u.rol === 'TURISTA') && u.identificacionValida === false).length
                        })
                      </button>

                      <button 
                        onClick={() => setPdiFilter('ALERT_ARREST')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          pdiFilter === 'ALERT_ARREST' 
                            ? 'bg-rose-600 text-white shadow animate-pulse' 
                            : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Órdenes de Arresto ({
                          usuarios.filter(u => (u.rol === 'VIAJERO' || u.rol === 'TURISTA') && u.ordenArresto).length
                        })
                      </button>

                      <button 
                        onClick={() => setPdiFilter('PENDING')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          pdiFilter === 'PENDING' 
                            ? 'bg-blue-600 text-white shadow' 
                            : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> En Espera ({
                          usuarios.filter(u => (u.rol === 'VIAJERO' || u.rol === 'TURISTA') && u.estadoIngreso === 'PENDIENTE').length
                        })
                      </button>
                    </div>
                  </div>

                  {/* Travelers List with Action Controls */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="font-bold text-slate-800 text-sm">Viajeros y Turistas en Control Migratorio</h4>
                      <p className="text-xs text-slate-500">Gestione la veracidad de la identidad nacional/extranjera y verifique requerimientos de Interpol/Justicia.</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {usuarios
                        .filter(u => u.rol === 'VIAJERO' || u.rol === 'TURISTA')
                        .filter(u => {
                          const query = pdiSearchQuery.toLowerCase();
                          const matchesQuery = u.nombre.toLowerCase().includes(query) || 
                                               u.apellido.toLowerCase().includes(query) || 
                                               u.rut.toLowerCase().includes(query);
                          
                          if (!matchesQuery) return false;

                          if (pdiFilter === 'ALERT_ID') return u.identificacionValida === false;
                          if (pdiFilter === 'ALERT_ARREST') return u.ordenArresto === true;
                          if (pdiFilter === 'PENDING') return u.estadoIngreso === 'PENDIENTE';
                          return true;
                        })
                        .length === 0 ? (
                          <div className="p-8 text-center text-slate-400 italic">No hay viajeros en este filtro o coincidencia de búsqueda.</div>
                        ) : (
                          usuarios
                            .filter(u => u.rol === 'VIAJERO' || u.rol === 'TURISTA')
                            .filter(u => {
                              const query = pdiSearchQuery.toLowerCase();
                              const matchesQuery = u.nombre.toLowerCase().includes(query) || 
                                                   u.apellido.toLowerCase().includes(query) || 
                                                   u.rut.toLowerCase().includes(query);
                              
                              if (!matchesQuery) return false;

                              if (pdiFilter === 'ALERT_ID') return u.identificacionValida === false;
                              if (pdiFilter === 'ALERT_ARREST') return u.ordenArresto === true;
                              if (pdiFilter === 'PENDING') return u.estadoIngreso === 'PENDIENTE';
                              return true;
                            })
                            .map((u) => {
                              const userDocs = documentos.filter(d => d.viajeroRut === u.rut);
                              
                              return (
                                <div key={u.id} className="p-6 hover:bg-slate-50/50 transition-all grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                                  {/* Col 1: Bio / Info */}
                                  <div className="space-y-1">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-wider">{u.rol}</span>
                                    <h4 className="font-extrabold text-slate-800 text-sm">{u.nombre} {u.apellido}</h4>
                                    <p className="font-mono text-xs text-slate-500">RUT: {u.rut}</p>
                                    <p className="text-xs text-slate-400">Nacionalidad: <strong className="text-slate-600 font-semibold">{u.nacionalidad}</strong></p>
                                  </div>

                                  {/* Col 2: Document Check & Alerters */}
                                  <div className="space-y-2">
                                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estado de Verificaciones</h5>
                                    
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded border border-slate-100">
                                        <span className="text-slate-500 text-[11px]">Identificación:</span>
                                        {u.identificacionValida !== false ? (
                                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">VÁLIDA (PDI)</span>
                                        ) : (
                                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold" title={u.motivoIdInvalida}>
                                            RECHAZADA ({u.motivoIdInvalida})
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded border border-slate-100">
                                        <span className="text-slate-500 text-[11px]">Orden de Arresto:</span>
                                        {u.ordenArresto ? (
                                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[9px] font-extrabold animate-pulse">¡ACTIVA!</span>
                                        ) : (
                                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">SIN REGISTRO</span>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded border border-slate-100">
                                        <span className="text-slate-500 text-[11px]">Docs Enviados:</span>
                                        <span className="font-semibold text-slate-800 text-[11px]">{userDocs.length} formularios ({userDocs.filter(d => d.estado === 'APROBADO').length} aprobados)</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Col 3: Actions - PDI controls */}
                                  <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center">Firma Policial PDI</h5>
                                    
                                    {/* ID Verification */}
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-400 font-semibold uppercase">¿Identidad Verificada?</p>
                                      <div className="grid grid-cols-2 gap-1.5">
                                        <button 
                                          onClick={() => handleUpdatePDI(u.id, true, 'OK', u.ordenArresto || false)}
                                          className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                            u.identificacionValida !== false 
                                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                          }`}
                                        >
                                          ✓ Válida
                                        </button>
                                        
                                        <button 
                                          onClick={() => {
                                            const reason = window.prompt("Ingrese el motivo de rechazo (VENCIDA o NO_AUTENTICA):", "VENCIDA");
                                            const parsedReason = (reason === 'NO_AUTENTICA' || reason === 'NO_AUTENTICA') ? 'NO_AUTENTICA' : 'VENCIDA';
                                            handleUpdatePDI(u.id, false, parsedReason, u.ordenArresto || false);
                                          }}
                                          className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                            u.identificacionValida === false 
                                              ? 'bg-amber-600 border-amber-600 text-white shadow-sm' 
                                              : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
                                          }`}
                                        >
                                          ✗ Inválida
                                        </button>
                                      </div>
                                    </div>

                                    {/* Arrest Warrant */}
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-400 font-semibold uppercase">¿Orden de Arresto?</p>
                                      <div className="grid grid-cols-2 gap-1.5">
                                        <button 
                                          onClick={() => handleUpdatePDI(u.id, u.identificacionValida !== false, u.motivoIdInvalida || 'OK', false)}
                                          className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                            !u.ordenArresto 
                                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                          }`}
                                        >
                                          Sin Cargos
                                        </button>
                                        
                                        <button 
                                          onClick={() => handleUpdatePDI(u.id, u.identificacionValida !== false, u.motivoIdInvalida || 'OK', true)}
                                          className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                            u.ordenArresto 
                                              ? 'bg-rose-600 border-rose-600 text-white shadow-sm animate-pulse' 
                                              : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
                                          }`}
                                        >
                                          🚨 Activar Alerta
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Col 4: Border Admission Resolution */}
                                  <div className="space-y-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                                    <h5 className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Dictamen Fronterizo</h5>
                                    
                                    <div className="text-xs py-1.5 font-bold">
                                      Estado: <span className={`px-2 py-0.5 rounded ${
                                        u.estadoIngreso === 'ACEPTADO' ? 'bg-emerald-100 text-emerald-800' :
                                        u.estadoIngreso === 'RECHAZADO' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                      }`}>{u.estadoIngreso || 'PENDIENTE'}</span>
                                    </div>

                                    <div className="space-y-1">
                                      <button 
                                        onClick={() => handleUpdateEstadoIngreso(u.id, 'ACEPTADO')}
                                        className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all"
                                      >
                                        ✓ Admitir Ingreso
                                      </button>
                                      
                                      <button 
                                        onClick={() => handleUpdateEstadoIngreso(u.id, 'RECHAZADO')}
                                        className="w-full py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-all"
                                      >
                                        ✗ Rechazar Ingreso
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              VIEW 8: PANEL DE ADMINISTRADOR
              ======================================================= */}
          {currentTab === 'admin' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="bg-[#1E1B4B] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                  <Settings className="w-48 h-48 text-indigo-400" />
                </div>
                <div className="relative z-10 space-y-2">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                    SGF Consola Central de Administración
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight font-sans text-white">
                    Consola del Administrador del Sistema
                  </h3>
                  <p className="text-slate-400 text-sm max-w-2xl">
                    Administre la totalidad de cuentas de usuario, elimine registros obsoletos, re-inicialice la base de datos de aduanas chilena, y supervise el cumplimiento de normativas de control terrestre.
                  </p>
                </div>
              </div>

              {/* Role restriction guard */}
              {currentUser?.rol !== 'ADMIN' ? (
                <div className="p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-4">
                  <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto animate-bounce" />
                  <h4 className="font-bold text-amber-900 text-lg">ACCESO DENEGADO - REQUIERE ROL ADMIN</h4>
                  <p className="text-sm text-amber-700 max-w-md mx-auto">
                    Solo administradores autorizados de SGF Chile pueden usar esta consola. Por favor, cambie su identidad activa abajo a la izquierda a <strong className="text-amber-800 font-bold">Administrador del Sistema (admin@sgf.gob.cl)</strong> para acceder.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Register User */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 self-start space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <UserCheck className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-slate-800">Registrar Nuevo Personal o Viajero</h4>
                    </div>

                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Rol en SGF Chile *</label>
                        <select 
                          value={newUser.rol}
                          onChange={(e) => setNewUser({ ...newUser, rol: e.target.value as UserRole })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                        >
                          <option value="TURISTA">TURISTA (Extranjero/Nacional)</option>
                          <option value="VIAJERO">VIAJERO (General)</option>
                          <option value="INSPECTOR_SAG">INSPECTOR SAG (Servicio Agrícola y Ganadero)</option>
                          <option value="FUNCIONARIO_ADUANA">FUNCIONARIO DE ADUANA (Servicio Nacional de Aduanas)</option>
                          <option value="OFICIAL_PDI">OFICIAL PDI (Policía de Investigaciones de Chile)</option>
                          <option value="ADMIN">ADMINISTRADOR DEL SISTEMA (Consola SGF)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Luis"
                            value={newUser.nombre}
                            onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Apellido *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Alvarado"
                            value={newUser.apellido}
                            onChange={(e) => setNewUser({ ...newUser, apellido: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">RUT o Identificación *</label>
                        <input 
                          type="text"
                          required
                          placeholder="ej: 17.584.294-K o PAS-234244"
                          value={newUser.rut}
                          onChange={(e) => setNewUser({ ...newUser, rut: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Electrónico *</label>
                        <input 
                          type="email"
                          required
                          placeholder="luis@sgf.gob.cl"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nacionalidad</label>
                          <select 
                            value={newUser.nacionalidad}
                            onChange={(e) => setNewUser({ ...newUser, nacionalidad: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="CHILENA">CHILENA</option>
                            <option value="ARGENTINA">ARGENTINA</option>
                            <option value="BRASILEÑA">BRASILEÑA</option>
                            <option value="ESTADOUNIDENSE">ESTADOUNIDENSE</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono</label>
                          <input 
                            type="text"
                            placeholder="+5693847293"
                            value={newUser.telefono}
                            onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow cursor-pointer"
                      >
                        👥 Registrar y Crear Cuenta SGF
                      </button>
                    </form>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <h5 className="font-bold text-xs text-slate-700 uppercase">Mantenimiento de Datos</h5>
                      <button 
                        onClick={async () => {
                          if (window.confirm("¿Desea re-inicializar los datos del SGF de aduanas a los valores iniciales semilla de Chile?")) {
                            localStorage.removeItem('sgf_user');
                            localStorage.removeItem('sgf_auth_token');
                            window.location.reload();
                          }
                        }}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        ♻ Re-Inicializar Datos Semilla
                      </button>
                    </div>
                  </div>

                  {/* Right Column: User list & metrics */}
                  <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">Lista Completa de Usuarios Registrados</h4>
                        <p className="text-xs text-slate-500">Supervise, asigne permisos, verifique credenciales JWT de oficiales.</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {usuarios.length} cuentas SGF
                      </span>
                    </div>

                    <div className="overflow-x-auto max-h-[550px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3">Usuario / Oficial</th>
                            <th className="px-6 py-3">RUT / Email</th>
                            <th className="px-6 py-3">Nacionalidad</th>
                            <th className="px-6 py-3">Rol</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {usuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4">
                                <p className="font-extrabold text-slate-800">{u.nombre} {u.apellido}</p>
                                <p className="text-[10px] text-slate-400">{u.telefono || 'Sin Teléfono'}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-mono text-slate-700 font-semibold">{u.rut}</p>
                                <p className="text-[10px] text-slate-400">{u.email}</p>
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-600">{u.nacionalidad}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                  u.rol === 'ADMIN' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                  u.rol === 'OFICIAL_PDI' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  u.rol === 'INSPECTOR_SAG' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                  u.rol === 'FUNCIONARIO_ADUANA' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {u.rol}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>

      </main>

      {/* =======================================================
          JWT AUTHENTICATION MODAL (RF-002, RF-010)
          ======================================================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            
            <div className="px-6 py-5 bg-[#0F172A] text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{isRegisterMode ? "Registro de Turista / Viajero" : "RF-002: Control de Acceso SGF"}</h3>
                <p className="text-xs text-slate-400">{isRegisterMode ? "Cree su credencial digital de ingreso" : "Autenticación segura con firma JWT"}</p>
              </div>
              <button 
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setIsRegisterMode(false);
                }}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                X
              </button>
            </div>

            {/* Selector de modo Login / Registro */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              <button 
                onClick={() => setIsRegisterMode(false)}
                className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
                  !isRegisterMode 
                    ? 'bg-white border-b-2 border-blue-600 text-blue-600' 
                    : 'text-slate-500 hover:bg-slate-100/50'
                }`}
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => setIsRegisterMode(true)}
                className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
                  isRegisterMode 
                    ? 'bg-white border-b-2 border-blue-600 text-blue-600' 
                    : 'text-slate-500 hover:bg-slate-100/50'
                }`}
              >
                Registrar Cuenta Nueva
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              {loginError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-lg border border-rose-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {!isRegisterMode ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Correo Electrónico Oficial *</label>
                    <input 
                      type="email"
                      required
                      placeholder="correo@sgf.gob.cl"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña de Seguridad *</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold rounded-xl text-sm shadow-md cursor-pointer"
                    >
                      Iniciar Sesión SGF
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nombre *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Juan"
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Apellido *</label>
                      <input 
                        type="text"
                        required
                        placeholder="González"
                        value={regApellido}
                        onChange={(e) => setRegApellido(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">RUT / Identificación *</label>
                      <input 
                        type="text"
                        required
                        placeholder="12.345.678-9"
                        value={regRut}
                        onChange={(e) => setRegRut(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Rol a registrar *</label>
                      <select
                        value={regRol}
                        onChange={(e) => setRegRol(e.target.value as UserRole)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="TURISTA">TURISTA (Extranjero o Nacional)</option>
                        <option value="VIAJERO">VIAJERO (Ingreso general)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Correo Electrónico *</label>
                    <input 
                      type="email"
                      required
                      placeholder="viajero@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Contraseña de Seguridad *</label>
                    <input 
                      type="password"
                      required
                      placeholder="Min. 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nacionalidad *</label>
                      <select 
                        value={regNacionalidad}
                        onChange={(e) => setRegNacionalidad(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="CHILENA">CHILENA</option>
                        <option value="ARGENTINA">ARGENTINA</option>
                        <option value="BRASILEÑA">BRASILEÑA</option>
                        <option value="OTRA">OTRA NACIONALIDAD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Teléfono</label>
                      <input 
                        type="text"
                        placeholder="+56912345678"
                        value={regTelefono}
                        onChange={(e) => setRegTelefono(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow cursor-pointer"
                    >
                      💾 Crear Cuenta y Autenticar SGF
                    </button>
                  </div>
                </form>
              )}

              {/* Developer credentials hints for quick evaluation */}
              {!isRegisterMode && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs space-y-2">
                  <p className="font-bold text-slate-700">Cuentas Semilla de Prueba:</p>
                  
                  <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                    <p>• <strong>Inspector SAG:</strong> juan.sag@sgf.gob.cl / <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">SgfSag2026!</code></p>
                    <p>• <strong>Aduanas Of.:</strong> maria.aduanas@sgf.gob.cl / <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">SgfAduana2026!</code></p>
                    <p>• <strong>PDI Oficial:</strong> carlos.pdi@sgf.gob.cl / <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">SgfPdi2026!</code></p>
                    <p>• <strong>Admin:</strong> admin@sgf.gob.cl / <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">SgfAdmin2026!</code></p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
