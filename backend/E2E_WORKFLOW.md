# Test E2E: Flujo Completo de Postulación a Ayudantía

## Descripción General

Este documento describe el test end-to-end (E2E) que valida el flujo completo de postulación a una posición de ayudante, desde la creación de la asignatura hasta el cierre de postulaciones.

## Ubicación del Test

```
src/postulacion-workflow.spec.ts
```

## Flujo Escenario del Test

El test cubre el siguiente flujo de negocio realista:

### 1. **Crear una Asignatura** 
   - **Servicio**: `AsignaturaService.create()`
   - **Datos**: Crea una asignatura "Fisiopatología" en el departamento "Medicina"
   - **Validaciones**:
     - La asignatura se crea exitosamente
     - El ID se asigna correctamente
     - El estado inicial es "cerrado"
     - `abierta_postulacion` es `false`

### 2. **Abrir el Concurso (Llamado Postulación)** 
   - **Servicio**: `LlamadoPostulacionService.create()`
   - **Actores**:
     - Secretaria docente (rut: 11111111-1)
     - Coordinadores (rut: 22222222-2)
   - **Cambios de Estado**:
     - `asignatura.abierta_postulacion` cambia a `true`
     - `asignatura.estado` cambia a `"abierto"`
   - **Validaciones**:
     - El llamado se crea correctamente
     - La asignatura ahora está abierta a postulaciones
     - Se establecen fechas de inicio y cierre

### 3. **Un Alumno Postula** 
   - **Servicio**: `PostulacionService.create()`
   - **Datos del Alumno**:
     - RUT: 12345678-9
     - Nombre: Juan Pérez
     - Promedio: 5.8
     - Nivel: 3 (Carrera de Medicina)
   - **Cálculo Automático de Puntuación Etapa 1**:
     - Incluye: aprobación de semestres + calificación en asignatura + promedio carrera + oportunidad + ayudantías previas + evaluación de ayudantías
     - Resultado: 18 puntos
   - **Validaciones**:
     - La postulación se crea exitosamente
     - La puntuación etapa1 se calcula automáticamente
     - El estado es activo (`es_actual = true`)
     - No está rechazada inicialmente

### 4. **Evaluación: Puntuación Etapa 2** 
   - **Servicio**: `PostulacionService.puntuacionetapa2()`
   - **Evaluación del Coordinador**: 20 puntos
   - **Validaciones**:
     - La puntuación etapa 2 se registra correctamente
     - Puntuación total: 38 puntos (18 + 20)
     - Los datos se persisten correctamente

### 5. **Aceptación de Postulación** 
   - **Validación**: La postulación NO está rechazada
   - **Estado Final**:
     - `rechazada_por_jefatura = false`
     - Puntuación total: 38 puntos
     - Candidato apto para ser asignado como ayudante
   - **Nota**: En un flujo real, esto llevaría a crear un registro de `Ayudantia`

### 6. **Cierre de Postulaciones** 
   - **Servicio**: `AsignaturaService` (actualización)
   - **Cambios de Estado**:
     - `asignatura.abierta_postulacion` cambia a `false`
     - `asignatura.estado` cambia a `"cerrado"`
   - **Validaciones**:
     - La asignatura ya no acepta nuevas postulaciones
     - El período de postulación ha finalizado

## Estructura del Test

```typescript
describe('Postulación E2E: Flujo completo', () => {
  // Variables globales para seguimiento del flujo
  let asignaturaId: number;
  let alumnoRut: string;
  let postulacionId: number;

  // Configuración previa
  beforeAll(async () => { /* inicializar módulo de prueba */ });
  
  // Limpieza posterior
  afterAll(async () => { /* cerrar aplicación */ });

  // Tests secuenciales
  it('1. Debe crear una asignatura exitosamente', ...)
  it('2. Debe abrir el concurso con llamado postulación', ...)
  it('3. Un alumno debe postular a la asignatura', ...)
  it('4. La postulación debe ser evaluada (puntuación etapa 2)', ...)
  it('5. La postulación debe ser aceptada (no rechazada)', ...)
  it('6. Debe cerrar la asignatura a postulaciones', ...)
  it('Flujo completo: de creación a cierre', ...)
});
```

## Datos Mock Utilizados

### Asignatura
```javascript
{
  id: 1,
  nombre: 'Fisiopatología',
  nrc: '12345',
  semestre: 2,
  estado: 'cerrado' → 'abierto' → 'cerrado'
  abierta_postulacion: false → true → false
}
```

### Alumno
```javascript
{
  rut_alumno: '12345678-9',
  nombres: 'Juan',
  apellidos: 'Pérez',
  correo: 'juan@example.com',
  promedio: 5.8,
  nivel: 3,
  codigo_carrera: 'MED'
}
```

### Usuarios
```javascript
// Secretaria
{
  rut: '11111111-1',
  tipo: 'secretaria_docente',
  correo: 'maria@example.com'
}

// Coordinador
{
  rut: '22222222-2',
  tipo: 'coordinador',
  correo: 'carlos@example.com'
}
```

### Postulación
```javascript
{
  id: 1,
  usuario: { rut: '12345678-9' },
  asignatura: { id: 1 },
  puntuacion_etapa1: 18,
  puntuacion_etapa2: 20,
  puntuacion_total: 38,
  cancelada_por_usuario: false,
  rechazada_por_jefatura: false,
  es_actual: true
}
```

## Servicios Probados

1. **AsignaturaService**
   - `create()`: Crear nueva asignatura
   - `findOneBy()`: Buscar asignatura existente
   - `save()`: Persisten cambios de estado

2. **LlamadoPostulacionService**
   - `create()`: Abrir concurso de postulación
   - Valida secretaria y coordinadores
   - Actualiza estado de asignatura

3. **PostulacionService**
   - `create()`: Registrar postulación de alumno
   - `puntuacionetapa2()`: Evaluar postulación (etapa 2)
   - Cálculo automático de puntuación etapa 1

4. **UsuarioService**
   - `findforLogin()`: Buscar usuario por credenciales

5. **AlumnoService**
   - `findByRut()`: Buscar alumno por RUT
   - Validación de datos de estudiante

## Mocks Utilizados

Todos los repositorios están completamente mockeados:

```typescript
{
  provide: 'AsignaturaRepository',
  useValue: {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  },
},
// ... otros repositorios
```

El `EmailService` también está mockeado para evitar envíos de email reales.

## Ejecución

### Ejecutar solo este test E2E:
```bash
npm test -- postulacion-workflow
```

### Ejecutar todos los tests incluyendo el E2E:
```bash
npm test
```

## Resultado Esperado

```
PASS src/postulacion-workflow.spec.ts (21.262 s)
  Postulación E2E: Flujo completo
    ✓ 1. Debe crear una asignatura exitosamente (32 ms)
    ✓ 2. Debe abrir el concurso con llamado postulación (20 ms)
    ✓ 3. Un alumno debe postular a la asignatura (7 ms)
    ✓ 4. La postulación debe ser evaluada (puntuación etapa 2) (1 ms)
    ✓ 5. La postulación debe ser aceptada (no rechazada) (3 ms)
    ✓ 6. Debe cerrar la asignatura a postulaciones (3 ms)
    ✓ Flujo completo: de creación a cierre (6 ms)

Test Suites: 1 passed
Tests: 7 passed, 7 total
Time: 27.742 s
```

## Validaciones Incluidas

 Creación de entidades (Asignatura)
 Cambio de estado de entidades
 Cálculo automático de puntuaciones
 Flujo multi-servicio (integración)
 Validación de relaciones entre entidades
 Persistencia de datos a través de repositories
 Secuencia lógica de operaciones de negocio

## Consideraciones Futuras

- **Integración con Base de Datos Real**: Actualmente usa mocks. Puede migrarse a tests de integración con BD real.
- **Validación de Email**: Actualmente mockeado. Podrían agregarse tests para verificar envío de emails de notificación.
- **Escenarios de Rechazo**: Pueden agregarse tests adicionales para flujos alternativos (postulación rechazada, cancelada por usuario, etc.).
- **Validaciones de Negocio**: Agregar más validaciones como límite de ayudantías simultáneas, requisitos académicos, etc.
- **Performance**: Medir y optimizar tiempos de ejecución conforme crece la complejidad.

## Referencias

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Testing Documentation](https://jestjs.io/)
- [TypeORM Repository Documentation](https://typeorm.io/working-with-repositories)
