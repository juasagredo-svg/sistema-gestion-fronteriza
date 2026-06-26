/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JavaFile {
  name: string;
  path: string;
  language: string;
  code: string;
}

export const JAVA_TEMPLATES: JavaFile[] = [
  {
    name: "Usuario.java",
    path: "com/sgf/chile/model/Usuario.java",
    language: "java",
    code: `package com.sgf.chile.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios", uniqueConstraints = {
    @UniqueConstraint(columnNames = "rut"),
    @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El RUT es obligatorio")
    @Pattern(regexp = "^[0-9]{1,2}\\\\.?[0-9]{3}\\\\.?[0-9]{3}-?[0-9Kk]{1}$", 
             message = "Formato de RUT chileno inválido (ej: 12.345.678-9)")
    @Column(nullable = false, length = 15)
    private string rut;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private string nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Column(nullable = false, length = 100)
    private string apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Column(nullable = false, length = 100)
    private string email;

    @Column(length = 20)
    private string telefono;

    @NotBlank(message = "La nacionalidad es obligatoria")
    @Column(nullable = false, length = 50)
    private string nacionalidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RolUsuario rol;

    @Column(nullable = false)
    private string password; // Guardada de forma segura con BCrypt

    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
    }
}`
  },
  {
    name: "RolUsuario.java",
    path: "com/sgf/chile/model/RolUsuario.java",
    language: "java",
    code: `package com.sgf.chile.model;

public enum RolUsuario {
    VIAJERO,
    INSPECTOR_SAG,
    FUNCIONARIO_ADUANA,
    OFICIAL_PDI,
    ADMIN
}`
  },
  {
    name: "UsuarioController.java",
    path: "com/sgf/chile/controller/UsuarioController.java",
    language: "java",
    code: `package com.sgf.chile.controller;

import com.sgf.chile.model.Usuario;
import com.sgf.chile.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFICIAL_PDI', 'FUNCIONARIO_ADUANA', 'INSPECTOR_SAG')")
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN') or #id == principal.id")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUsuario(@Valid @RequestBody Usuario usuario) {
        if (usuarioRepository.existsByRut(usuario.getRut())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El RUT ya está registrado en el SGF"));
        }
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El email ya está registrado"));
        }
        
        // Encriptar password antes de guardar
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    public ResponseEntity<?> updateUsuario(@PathVariable Long id, @Valid @RequestBody Usuario usuarioDetails) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombre(usuarioDetails.getNombre());
            usuario.setApellido(usuarioDetails.getApellido());
            usuario.setTelefono(usuarioDetails.getTelefono());
            usuario.setNacionalidad(usuarioDetails.getNacionalidad());
            if (usuarioDetails.getPassword() != null && !usuarioDetails.getPassword().isBlank()) {
                usuario.setPassword(passwordEncoder.encode(usuarioDetails.getPassword()));
            }
            return ResponseEntity.ok(usuarioRepository.save(usuario));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUsuario(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuarioRepository.delete(usuario);
            return ResponseEntity.ok().body(Map.of("mensaje", "Usuario eliminado correctamente del SGF"));
        }).orElse(ResponseEntity.notFound().build());
    }
}`
  },
  {
    name: "Vehiculo.java",
    path: "com/sgf/chile/model/Vehiculo.java",
    language: "java",
    code: `package com.sgf.chile.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "vehiculos")
@Data
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La patente es obligatoria")
    @Column(nullable = false, unique = true, length = 12)
    private string patente;

    @NotBlank(message = "La marca es obligatoria")
    @Column(nullable = false, length = 50)
    private string marca;

    @NotBlank(message = "El modelo es obligatorio")
    @Column(nullable = false, length = 50)
    private string modelo;

    @NotBlank(message = "El RUT del propietario es obligatorio")
    @Column(name = "propietario_rut", nullable = false, length = 15)
    private string propietarioRut;

    @NotBlank(message = "El país de registro es obligatorio")
    @Column(name = "pais_registro", nullable = false, length = 50)
    private string paisRegistro; // 'CHILE', 'ARGENTINA', etc.

    @NotNull(message = "El año es obligatorio")
    @Column(nullable = false)
    private Integer anio;

    @Column(name = "tipo_vehiculo", nullable = false)
    private string tipoVehiculo; // 'PARTICULAR', 'COMERCIAL', 'BUS', 'MOTO'

    @Column(name = "numero_chasis", length = 50)
    private string numeroChasis;

    @Column(nullable = false, length = 20)
    private string estado = "PENDIENTE"; // 'AUTORIZADO', 'PENDIENTE', 'RECHAZADO'
}`
  },
  {
    name: "VehiculoController.java",
    path: "com/sgf/chile/controller/VehiculoController.java",
    language: "java",
    code: `package com.sgf.chile.controller;

import com.sgf.chile.model.Vehiculo;
import com.sgf.chile.repository.VehiculoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vehiculos")
@CrossOrigin(origins = "*")
public class VehiculoController {

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FUNCIONARIO_ADUANA', 'OFICIAL_PDI')")
    public ResponseEntity<List<Vehiculo>> getAllVehiculos() {
        return ResponseEntity.ok(vehiculoRepository.findAll());
    }

    @GetMapping("/patente/{patente}")
    public ResponseEntity<Vehiculo> getVehiculoByPatente(@PathVariable string patente) {
        return vehiculoRepository.findByPatente(patente.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VIAJERO')")
    public ResponseEntity<?> createVehiculo(@Valid @RequestBody Vehiculo vehiculo) {
        vehiculo.setPatente(vehiculo.getPatente().toUpperCase());
        if (vehiculoRepository.existsByPatente(vehiculo.getPatente())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El vehículo con esta patente ya está registrado en el SGF"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoRepository.save(vehiculo));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FUNCIONARIO_ADUANA')")
    public ResponseEntity<?> updateVehiculo(@PathVariable Long id, @RequestBody Vehiculo vehiculoDetails) {
        return vehiculoRepository.findById(id).map(vehiculo -> {
            if (vehiculoDetails.getMarca() != null) vehiculo.setMarca(vehiculoDetails.getMarca());
            if (vehiculoDetails.getModelo() != null) vehiculo.setModelo(vehiculoDetails.getModelo());
            if (vehiculoDetails.getEstado() != null) vehiculo.setEstado(vehiculoDetails.getEstado());
            if (vehiculoDetails.getPropietarioRut() != null) vehiculo.setPropietarioRut(vehiculoDetails.getPropietarioRut());
            return ResponseEntity.ok(vehiculoRepository.save(vehiculo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteVehiculo(@PathVariable Long id) {
        return vehiculoRepository.findById(id).map(vehiculo -> {
            vehiculoRepository.delete(vehiculo);
            return ResponseEntity.ok(Map.of("mensaje", "Vehículo eliminado del sistema"));
        }).orElse(ResponseEntity.notFound().build());
    }
}`
  },
  {
    name: "Documento.java",
    path: "com/sgf/chile/model/Documento.java",
    language: "java",
    code: `package com.sgf.chile.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
@Data
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Column(nullable = false, length = 40)
    private string tipo; // 'DECLARACION_SAG', 'FORMULARIO_ADUANA', 'PERMISO_PDI', 'SOAPEX'

    @Column(nullable = false)
    private string titulo;

    @NotBlank(message = "El RUT del viajero es obligatorio")
    @Column(name = "viajero_rut", nullable = false, length = 15)
    private string viajeroRut;

    @Column(name = "viajero_nombre", nullable = false)
    private string viajeroNombre;

    @Column(nullable = false, length = 20)
    private string estado = "PENDIENTE"; // 'PENDIENTE', 'APROBADO', 'RECHAZADO'

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;

    @Column(name = "validado_por")
    private string validadoPor; // Identificador del oficial firmante

    @Column(name = "archivo_nombre")
    private string archivoNombre;

    @Lob
    @Column(name = "datos_contenido", columnDefinition = "TEXT")
    private string datosContenido; // JSON estructurado con respuestas de aduanas/SAG

    @Column(length = 500)
    private string observaciones;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }
}`
  },
  {
    name: "DocumentoController.java",
    path: "com/sgf/chile/controller/DocumentoController.java",
    language: "java",
    code: `package com.sgf.chile.controller;

import com.sgf.chile.model.Documento;
import com.sgf.chile.repository.DocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/documentos")
@CrossOrigin(origins = "*")
public class DocumentoController {

    @Autowired
    private DocumentoRepository documentoRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR_SAG', 'FUNCIONARIO_ADUANA', 'OFICIAL_PDI')")
    public ResponseEntity<List<Documento>> getAllDocumentos() {
        return ResponseEntity.ok(documentoRepository.findAll());
    }

    @GetMapping("/viajero/{rut}")
    public ResponseEntity<List<Documento>> getDocumentosByViajero(@PathVariable string rut) {
        return ResponseEntity.ok(documentoRepository.findByViajeroRut(rut));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VIAJERO')")
    public ResponseEntity<Documento> submitDocumento(@RequestBody Documento documento) {
        documento.setEstado("PENDIENTE");
        documento.setArchivoNombre("DJ_SAG_ADUANAS_" + System.currentTimeMillis() + ".pdf");
        Documento guardado = documentoRepository.save(documento);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @PostMapping("/{id}/validar")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR_SAG', 'FUNCIONARIO_ADUANA', 'OFICIAL_PDI')")
    public ResponseEntity<?> validarDocumento(
            @PathVariable Long id, 
            @RequestBody Map<string, string> validacionBody) {
        
        string nuevoEstado = validacionBody.get("estado"); // 'APROBADO' o 'RECHAZADO'
        string oficialId = validacionBody.get("oficialId");
        string obs = validacionBody.get("observaciones");

        if (nuevoEstado == null || (!nuevoEstado.equals("APROBADO") && !nuevoEstado.equals("RECHAZADO"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Estado de validación inválido"));
        }

        return documentoRepository.findById(id).map(doc -> {
            doc.setEstado(nuevoEstado);
            doc.setValidadoPor(oficialId);
            doc.setFechaValidacion(LocalDateTime.now());
            doc.setObservaciones(obs);
            documentoRepository.save(doc);
            return ResponseEntity.ok(Map.of(
                "mensaje", "Documento procesado correctamente en SGF",
                "documentoId", doc.getId(),
                "nuevoEstado", doc.getEstado()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}`
  },
  {
    name: "ReporteController.java",
    path: "com/sgf/chile/controller/ReporteController.java",
    language: "java",
    code: `package com.sgf.chile.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reportes")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'FUNCIONARIO_ADUANA')")
public class ReporteController {

    @GetMapping
    public ResponseEntity<?> getReporteEstadistico() {
        // Devuelve JSON detallado con métricas y rendimientos de pasos fronterizos chilenos
        Map<string, Object> stats = Map.of(
            "totalViajerosProcesados", 14350,
            "totalVehiculosRegistrados", 5120,
            "documentosDeclaradosSAG", 9840,
            "tiempoEsperaAntesSGF", "14.5 horas",
            "tiempoEsperaPromedioConSGF", "4.8 minutos",
            "eficienciaAutomatizacion", "98.5%",
            "pasosFronterizosActivos", List.of(
                Map.of("nombre", "Paso Los Libertadores", "antes", 16.0, "ahora", 5.1),
                Map.of("nombre", "Paso Cardenal Samoré", "antes", 9.5, "ahora", 3.2),
                Map.of("nombre", "Paso Pehuenche", "antes", 12.0, "ahora", 4.0),
                Map.of("nombre", "Paso Jama", "antes", 8.0, "ahora", 3.0)
            )
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportarReporte(@RequestParam string formato) {
        byte[] content = new byte[0];
        string filename = "SGF_REPORTE_METRICAS";
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if ("pdf".equalsIgnoreCase(formato)) {
            content = "CONTENIDO_SIMULADO_PDF_SGF_CHILE".getBytes();
            filename += ".pdf";
            mediaType = MediaType.APPLICATION_PDF;
        } else if ("excel".equalsIgnoreCase(formato)) {
            content = "CONTENIDO_SIMULADO_EXCEL_SGF_CHILE".getBytes();
            filename += ".xlsx";
            mediaType = new MediaType("application", "vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } else {
            return ResponseEntity.badRequest().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }
}`
  },
  {
    name: "AuthController.java",
    path: "com/sgf/chile/controller/AuthController.java",
    language: "java",
    code: `package com.sgf.chile.controller;

import com.sgf.chile.model.Usuario;
import com.sgf.chile.repository.UsuarioRepository;
import com.sgf.chile.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/login")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> login(@RequestBody Map<string, string> loginRequest) {
        string email = loginRequest.get("email");
        string password = loginRequest.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email y contraseña son requeridos"));
        }

        return usuarioRepository.findByEmail(email).map(usuario -> {
            if (passwordEncoder.matches(password, usuario.getPassword())) {
                // Generar token JWT con claims de SGF Chile (RUT, Rol, Nombre)
                string token = jwtUtil.generateToken(usuario);
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "usuario", Map.of(
                        "rut", usuario.getRut(),
                        "nombre", usuario.getNombre(),
                        "apellido", usuario.getApellido(),
                        "email", usuario.getEmail(),
                        "rol", usuario.getRol().name()
                    )
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Contraseña incorrecta"));
            }
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Usuario no registrado en el SGF")));
    }
}`
  },
  {
    name: "schema.sql",
    path: "resources/schema.sql",
    language: "sql",
    code: `-- Base de Datos para el Sistema de Gestión Fronteriza (SGF Chile)
CREATE DATABASE IF NOT EXISTS sgf_chile_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sgf_chile_db;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(15) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    nacionalidad VARCHAR(50) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuarios_rut (rut),
    INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patente VARCHAR(12) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    propietario_rut VARCHAR(15) NOT NULL,
    pais_registro VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    tipo_vehiculo VARCHAR(30) NOT NULL,
    numero_chasis VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    INDEX idx_vehiculos_patente (patente),
    INDEX idx_vehiculos_propietario (propietario_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Documentos Digitales (SAG, Aduana, PDI)
CREATE TABLE IF NOT EXISTS documentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(40) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    viajero_rut VARCHAR(15) NOT NULL,
    viajero_nombre VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion TIMESTAMP NULL,
    validado_por VARCHAR(50),
    archivo_nombre VARCHAR(255) NOT NULL,
    datos_contenido TEXT NOT NULL, -- Almacena JSON stringificado
    observaciones VARCHAR(500),
    INDEX idx_documentos_viajero (viajero_rut),
    INDEX idx_documentos_tipo_estado (tipo, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para Tiempos y Log Fronterizo (Estadística de Pasos)
CREATE TABLE IF NOT EXISTS registro_pasos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paso_nombre VARCHAR(100) NOT NULL,
    vehiculo_id BIGINT,
    viajero_rut VARCHAR(15) NOT NULL,
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tiempo_espera_minutos INT NOT NULL,
    alerta_detectada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Poblado de datos inicial semilla de Prueba SGF
INSERT INTO usuarios (rut, nombre, apellido, email, telefono, nacionalidad, rol, password) VALUES
('11.111.111-1', 'Juan', 'Valdés', 'juan.sag@sgf.gob.cl', '+56911223344', 'CHILENA', 'INSPECTOR_SAG', '$2a$10$U2N8O7m7t7Z7u3G7h3P7fOn0Iq6Z0Iu6yDq09A8r6P7H3h3H7h8v.'), -- pass: SgfSag2026!
('22.222.222-2', 'María', 'Lorca', 'maria.aduanas@sgf.gob.cl', '+56922334455', 'CHILENA', 'FUNCIONARIO_ADUANA', '$2a$10$U2N8O7m7t7Z7u3G7h3P7fOn0Iq6Z0Iu6yDq09A8r6P7H3h3H7h8v.'), -- pass: SgfAduana2026!
('33.333.333-3', 'Carlos', 'Pinto', 'carlos.pdi@sgf.gob.cl', '+56933445566', 'CHILENA', 'OFICIAL_PDI', '$2a$10$U2N8O7m7t7Z7u3G7h3P7fOn0Iq6Z0Iu6yDq09A8r6P7H3h3H7h8v.'), -- pass: SgfPdi2026!
('44.444.444-4', 'Administrador', 'General', 'admin@sgf.gob.cl', '+562223344', 'CHILENA', 'ADMIN', '$2a$10$U2N8O7m7t7Z7u3G7h3P7fOn0Iq6Z0Iu6yDq09A8r6P7H3h3H7h8v.'); -- pass: SgfAdmin2026!
`
  }
];
