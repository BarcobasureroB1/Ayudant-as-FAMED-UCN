#  Carga Masiva de Datos - CSV Seeding

Este directorio contiene los archivos CSV para la carga masiva de datos del sistema de ayudantías FAMED-UCN.

##  Archivos Esperados

### 1. `alumnos.csv`
**Formato:** Delimitador `;` (punto y coma)

**Columnas requeridas:**
- `RUT`: RUT del alumno (ej: 201687365)
- `PRIMER_NOMBRE`: Primer nombre
- `SEGUNDO_NOMBRE`: Segundo nombre (opcional)
- `APELLIDOPATERNO`: Apellido paterno
- `APELLIDOMATERNO`: Apellido materno
- `CORREO_ALUMNO`: Email institucional
- `ADMISION`: Año/periodo de admisión (ej: 201810)
- `CODCARRERA`: Código de carrera (ej: 8486)
- `NOMBRECARRERA`: Nombre de la carrera (ej: MEDICINA)
- `PROMEDIO`: Promedio del alumno (ej: 5.73)
- `NIVEL`: Nivel/semestre actual (ej: 3)
- `ESTADO_ACTUAL`: Estado del alumno (debe ser "Matriculado")
- `PERIODO`: Periodo actual (ej: 202520)

**Ejemplo:**
```csv
"RUT";"PRIMER_NOMBRE";"SEGUNDO_NOMBRE";"APELLIDOPATERNO";"APELLIDOMATERNO";"CORREO_ALUMNO";"ADMISION";"CODCARRERA";"NOMBRECARRERA";"PROMEDIO";"NIVEL";"ESTADO_ACTUAL";"PERIODO"
214605538;BENJAMIN;ANDRES;VILLAFAÑA;POBLETE;benjamin.villafana@alumnos.ucn.cl;202410;8486;MEDICINA;5.89;3;Matriculado;202520
```

### 2. `asignaturas.csv`
**Formato:** Delimitador `,` (coma)

**Columnas requeridas:**
- `PERIODO`: Periodo académico (ej: 202520)
- `DEPARTAMENTO`: Nombre del departamento
- `CURSO`: Código del curso (ej: DCBI-00402)
- `NOMBRE`: Nombre de la asignatura
- `PARALELO`: Paralelo (ej: C1, L1, T1)
- `NRC`: Número de referencia del curso (único)
- `TIPO`: Tipo de clase (CAT, LAB, TAL, CLI, etc.)
- `RUT_PROFESOR`: RUT del profesor
- `PRIMER_NOMBRE`: Primer nombre del profesor
- `SEGUNDO_NOMBRE`: Segundo nombre (opcional)
- `APELLIDOPATERNO`: Apellido paterno del profesor
- `APELLIDOMATERNO`: Apellido materno del profesor
- `CORREO_INSTITUCIONAL`: Email del profesor

**Nota:** Solo se cargan las asignaturas con `TIPO=CAT` (cátedras principales)

**Ejemplo:**
```csv
PERIODO,DEPARTAMENTO,CURSO,NOMBRE,PARALELO,NRC,TIPO,RUT_PROFESOR,PRIMER_NOMBRE,SEGUNDO_NOMBRE,APELLIDOPATERNO,APELLIDOMATERNO,CORREO_INSTITUCIONAL
202520,Depto. De Ciencias Biomédicas,DCBI-00402,Biomecánica,C1,20727,CAT,175123334,FERNANDO,SAAD,MARGARIÑOS,SELAIVE,fernando.magarinos@ucn.cl
```

##  Cómo Ejecutar el Seeding

### 1. Preparar los archivos CSV
Coloca tus archivos CSV en este directorio:
- `backend/data/alumnos.csv`
- `backend/data/asignaturas.csv`

### 2. Instalar dependencia
```bash
cd backend
npm install csv-parse
```

### 3. Ejecutar el script
```bash
npm run seed
```

##  Proceso de Carga

El script ejecuta en el siguiente orden:

1. **Departamentos** 
   - Crea departamentos base predefinidos
   - Evita duplicados

2. **Asignaturas** (desde CSV)
   - Lee `asignaturas.csv`
   - Filtra solo registros tipo `CAT`
   - Agrupa por NRC para evitar duplicados
   - Mapea departamentos automáticamente
   - Extrae semestre del periodo

3. **Alumnos** (desde CSV)
   - Lee `alumnos.csv`
   - Filtra solo alumnos con estado "Matriculado"
   - Valida datos obligatorios (RUT, correo)
   - Formatea RUT correctamente
   - Evita duplicados por RUT

##  Validaciones

### Alumnos:
- ✓ Solo alumnos con `ESTADO_ACTUAL = "Matriculado"`
- ✓ RUT y correo obligatorios
- ✓ Verificación de duplicados por RUT

### Asignaturas:
- ✓ Solo registros con `TIPO = "CAT"`
- ✓ Departamento debe existir
- ✓ NRC único
- ✓ Semestre extraído del periodo

##  Monitoreo

El script muestra:
-  Registros creados exitosamente
-   Registros que ya existían (skipped)
-  Errores encontrados (primeros 5)
-  Resumen final con contadores

##  Consideraciones

1. **Orden de ejecución**: Los departamentos deben existir antes que las asignaturas
2. **Duplicados**: El script detecta y omite duplicados automáticamente
3. **Errores**: Los errores en registros individuales no detienen el proceso completo
4. **Performance**: Para grandes volúmenes (>1000 registros), considera ejecutar en producción con más recursos

## Troubleshooting

### Error: "Cannot find module 'csv-parse'"
```bash
npm install csv-parse
```

### Error: "Archivo no encontrado"
Verifica que los CSV estén en `backend/data/` con los nombres exactos:
- `alumnos.csv`
- `asignaturas.csv`

### Error: "Departamento no encontrado"
Verifica que el nombre del departamento en el CSV coincida con los predefinidos en el script.

### Muchos errores en alumnos
- Verifica el delimitador (debe ser `;`)
- Verifica que los RUT sean válidos
- Verifica que los correos sean válidos
- Asegúrate que `ESTADO_ACTUAL = "Matriculado"`

## Ejemplo Completo

```bash
# 1. Copiar CSV a la carpeta data/
cp ~/Downloads/alumnos.csv backend/data/
cp ~/Downloads/asignaturas.csv backend/data/

# 2. Instalar dependencias
cd backend
npm install

# 3. Ejecutar seeding
npm run seed
```

## Re-ejecutar el Script

El script es **idempotente**: puedes ejecutarlo múltiples veces sin crear duplicados. Útil para:
- Agregar nuevos registros
- Recuperar de errores parciales
- Actualizar datos (aunque no modifica existentes)
