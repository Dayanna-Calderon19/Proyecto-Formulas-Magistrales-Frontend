# Auditoría del Backend – proyecto_formulas_magistrales

| Área | Estado | Evidencia encontrada | Problema detectado | Acción recomendada |
|------|--------|----------------------|-------------------|--------------------|
| **Estructura del proyecto** | Cumplido | Paquetes bajo `com.example.proyecto_formulas_magistrales` con sub‑paquetes `Config`, `Controller`, `DTO`, `Model`, `Repository`, `Security`, `Service`. | Ninguno | Ninguna |
| **Spring Security** | Cumplido | `SecurityConfig.java` configura CSRF disabled, CORS, sesión stateless, cadena de filtros, autorización por roles y permite `/api/auth/**`. | Ninguno | Ninguna |
| **JWT – generación** | Cumplido | `JwtService.generateToken(..)` crea token HS256 con secret y expiración configurable (`jwt.secret`, `jwt.expiration.ms`). | Ninguno | Ninguna |
| **JWT – validación** | Cumplido | `JwtService.validateToken(..)` verifica firma, expiración y username. | Ninguno | Ninguna |
| **Filtro JWT** | Cumplido | `JwtAuthenticationFilter` extrae header `Authorization`, valida token con `JwtService`, y establece `SecurityContext`. | Ninguno | Ninguna |
| **Endpoint de autenticación** | Cumplido | `AuthController` expone `POST /api/auth/login` que devuelve `LoginResponse` con el token. | No hay endpoint de logout o refresh. | Añadir endpoint `/api/auth/logout` (si se desea revocar) y `/api/auth/refresh` para renovar token. |
| **Gestión de contraseñas** | Cumplido | `SecurityConfig` declara `PasswordEncoder` como `BCryptPasswordEncoder`. `CustomUserDetailsService` devuelve la contraseña almacenada. | No se ve código de registro/actualización de usuarios que aplique el encoder. | Asegurar que al crear/actualizar usuarios la contraseña se codifique con `passwordEncoder.encode(...)`. |
| **Roles y autorización** | Cumplido | `SecurityConfig` protege `/api/usuarios/**` con `hasRole('ADMIN')` y `/api/medicos/**` con `hasAnyRole('ADMIN','MEDICO')`. `CustomUserDetailsService` asigna `ROLE_` + nombre. | No hay control fino a nivel de método en los controladores (solo a nivel de ruta). | Revisar si se necesita `@PreAuthorize` en servicios para operaciones críticas. |
| **Manejo de errores 401/403** | Parcial | La configuración dispara la cadena de filtros; sin embargo, no hay un `@ControllerAdvice` específico para traducir excepciones de seguridad a respuestas JSON. | Posibles respuestas HTML por defecto de Spring Security. | Implementar `RestAuthenticationEntryPoint` y `AccessDeniedHandler` para respuestas JSON consistentes. |
| **CORS** | Cumplido | `corsConfigurationSource()` permite cualquier origen (`*`) y métodos estándar, con cabeceras `Authorization` y `Content-Type`. | Uso abierto de `*`; puede ser inseguro en producción. | Restringir `allowedOrigins` a la URL del frontend Angular (`http://localhost:4200`) antes de ir a producción. |
| **API REST – controladores** | Cumplido | Existen controladores: `UsuarioController`, `PacienteController`, `MedicoController`, `RolController`, `FormulaMagistralController`, `ConsultaController`, `CitaController`. Cada uno bajo paquete `Controller`. | No se inspeccionó cada método; se asume que implementan CRUD típicos. | Revisar cada controlador para confirmar que los DTOs y validaciones cumplen con los requerimientos del frontend. |
| **Conexión con Angular** | Cumplido | Backend escucha en puerto **default** (Maven Wrapper sugiere 8080). `proxy.conf.json` del frontend redirige `/api` a `http://localhost:8080/api`. | No hay variable de puerto en `application.properties`; dependerá del entorno. | Documentar el puerto en `README` y parametrizar con `server.port` si se necesita otro. |
| **Documentación Swagger/OpenAPI** | No implementado | No se encontraron dependencias `springdoc-openapi` ni archivos de configuración. | Falta documentación automática de la API. | Añadir `springdoc-openapi-ui` y anotar controladores para generar Swagger. |

## Problemas críticos a corregir primero
1. **Respuesta JSON para errores de seguridad** – implementar `AuthenticationEntryPoint` y `AccessDeniedHandler`.
2. **Restricción de CORS** – limitar `allowedOrigins` a la URL del frontend antes de pasar a producción.
3. **Endpoint de logout/refresh** – si la aplicación lo requiere, añadirlos.
4. **Asegurar hashing de contraseñas en operaciones de registro/actualización**.

## Archivos que deberán modificarse en una futura etapa
- `SecurityConfig.java` (para afinar CORS y handlers de error).
- `AuthController.java` (añadir logout/refresh si se decide).
- `UsuarioController` / *Service* (aplicar `passwordEncoder.encode` al crear/actualizar usuarios).
- Añadir clase `RestAuthenticationEntryPoint.java` y `RestAccessDeniedHandler.java`.
- `pom.xml` (añadir `springdoc-openapi-ui` si se desea documentación).

## Orden recomendado para implementar/corregir
1. **Manejo de errores 401/403** (EntryPoint & AccessDeniedHandler).  
2. **CORS** – cambiar a dominio del frontend.  
3. **Endpoints de token** (logout/refresh) si se utilizan.  
4. **Hashing de contraseñas** en operaciones de usuario.  
5. **Documentación Swagger** (opcional).  
6. **Revisar y probar cada controlador** con pruebas de integración.

## Contrato de autenticación para Angular (si existe)
- **URL:** `POST /api/auth/login`
- **Request Body (JSON):** `{ "username": "string", "password": "string" }`
- **Response Body (JSON):** `{ "token": "<JWT>" }`
- **Uso del token:** Angular debe enviarlo en el encabezado `Authorization: Bearer <JWT>` en todas las peticiones al servidor.
- **Validez:** El token expira según la propiedad `jwt.expiration.ms` (por defecto 86400000 ms = 1 día).

## Pruebas recomendadas
- **Unitarias** para `JwtService` (generación, extracción, expiración, validación).
- **Integration tests** que invoquen `AuthController` y verifiquen token válido.
- **Tests de filtro** asegurando que solicitudes sin token son rechazadas (401) y con token válido pasan.
- **Tests de CORS** con origen `http://localhost:4200` y origen no permitido.
- **Tests de autorización** para rutas protegidas con roles `ADMIN` y `MEDICO`.
- **E2E** utilizando el frontend Angular para login y acceso a rutas restringidas.

---
*Este informe es meramente diagnóstico; no se han modificado archivos.*
