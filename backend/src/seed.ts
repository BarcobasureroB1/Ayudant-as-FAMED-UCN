import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DepartamentoService } from './modules/departamento/departamento.service';
import { AsignaturaService } from './modules/asignatura/asignatura.service';
import { AlumnoService } from './modules/alumno/alumno.service';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * Script de Seeding para cargar datos masivos desde CSV
 * 
 * Uso:
 *   npm run seed
 * 
 * Archivos CSV esperados en: backend/data/
 *   - alumnos.csv
 *   - asignaturas.csv
 */

interface AlumnoCSV {
  RUT: string;
  PRIMER_NOMBRE: string;
  SEGUNDO_NOMBRE: string;
  APELLIDOPATERNO: string;
  APELLIDOMATERNO: string;
  CORREO_ALUMNO: string;
  ADMISION: string;
  CODCARRERA: string;
  NOMBRECARRERA: string;
  PROMEDIO: string;
  NIVEL: string;
  ESTADO_ACTUAL: string;
  PERIODO: string;
}

interface AsignaturaCSV {
  PERIODO: string;
  DEPARTAMENTO: string;
  CURSO: string;
  NOMBRE: string;
  PARALELO: string;
  NRC: string;
  TIPO: string;
  RUT_PROFESOR: string;
  PRIMER_NOMBRE: string;
  SEGUNDO_NOMBRE: string;
  APELLIDOPATERNO: string;
  APELLIDOMATERNO: string;
  CORREO_INSTITUCIONAL: string;
}

async function bootstrap() {
  console.log(' Iniciando proceso de seeding...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const departamentoService = app.get(DepartamentoService);
  const asignaturaService = app.get(AsignaturaService);
  const alumnoService = app.get(AlumnoService);

  try {
    // ========================================
    // 1. CARGAR DEPARTAMENTOS
    // ========================================
    console.log(' Paso 1: Cargando Departamentos...');
    const departamentos = [
      'Depto. De Ciencias Biomédicas',
      'Depto. De Clínicas',
      'Medicina',
      'Enfermería',
      'Kinesiología',
      'Nutrición y Dietética',
    ];

    for (const nombre of departamentos) {
      try {
        // Verificar si ya existe buscando en todos
        const todos = await departamentoService.findAll();
        const existe = todos.find((d) => d.nombre === nombre);
        
        if (!existe) {
          await departamentoService.create({ nombre });
          console.log(`   Departamento creado: ${nombre}`);
        } else {
          console.log(`  ⏭  Departamento ya existe: ${nombre}`);
        }
      } catch (error) {
        console.error(`   Error creando departamento ${nombre}:`, error.message);
      }
    }

    // ========================================
    // 2. CARGAR ASIGNATURAS DESDE CSV
    // ========================================
    console.log('\n Paso 2: Cargando Asignaturas desde CSV...');
    const asignaturasPath = path.join(__dirname, '../data/asignaturas.csv');

    if (fs.existsSync(asignaturasPath)) {
      const asignaturasCSV = fs.readFileSync(asignaturasPath, 'utf-8');
      const asignaturas: AsignaturaCSV[] = parse(asignaturasCSV, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ',',
        trim: true,
        bom: true,
        relax_quotes: true,
      });

      console.log(`   Total de registros en CSV: ${asignaturas.length}`);

      // Agrupar por NRC para evitar duplicados
      const asignaturasUnicas = new Map<string, AsignaturaCSV>();
      asignaturas.forEach((asig) => {
        if (asig.NRC && asig.TIPO === 'CAT') {
          // Solo tomar las cátedras principales
          asignaturasUnicas.set(asig.NRC, asig);
        }
      });

      console.log(`   Asignaturas únicas a crear: ${asignaturasUnicas.size}`);

      let creadas = 0;
      let existentes = 0;
      let errores = 0;

      for (const [nrc, asig] of asignaturasUnicas) {
        try {
          // Mapear departamento
          let departamento = asig.DEPARTAMENTO;
          if (departamento.includes('Ciencias Biomédicas')) {
            departamento = 'Depto. De Ciencias Biomédicas';
          } else if (departamento.includes('Clínicas')) {
            departamento = 'Depto. De Clínicas';
          }

          // Extraer semestre del periodo (ej: 202520 -> 2)
          const semestre = parseInt(asig.PERIODO.slice(-1));

          const createDto = {
            nombre: asig.NOMBRE,
            nrc: asig.NRC,
            semestre: semestre,
            Departamento: departamento,
            estado: 'cerrado',
            abierta_postulacion: false,
          };

          const resultado = await asignaturaService.create(createDto);
          if (resultado) {
            creadas++;
            if (creadas % 10 === 0) {
              console.log(`   ${creadas} asignaturas creadas...`);
            }
          } else {
            existentes++;
          }
        } catch (error) {
          errores++;
          if (errores <= 5) {
            // Solo mostrar los primeros 5 errores
            console.error(`   Error con asignatura ${asig.NOMBRE}:`, error.message);
          }
        }
      }

      console.log(`\n   Resumen Asignaturas:`);
      console.log(`      Creadas: ${creadas}`);
      console.log(`     ⏭  Ya existían: ${existentes}`);
      console.log(`      Errores: ${errores}`);
    } else {
      console.log(`    Archivo no encontrado: ${asignaturasPath}`);
      console.log(`     Coloca el CSV en: backend/data/asignaturas.csv`);
    }

    // ========================================
    // 3. CARGAR ALUMNOS DESDE CSV
    // ========================================
    console.log('\n Paso 3: Cargando Alumnos desde CSV...');
    const alumnosPath = path.join(__dirname, '../data/alumnos.csv');

    if (fs.existsSync(alumnosPath)) {
      const alumnosCSV = fs.readFileSync(alumnosPath, 'utf-8');
      const alumnos: AlumnoCSV[] = parse(alumnosCSV, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ';',
        trim: true,
        bom: true,
        relax_quotes: true,
      });

      console.log(`   Total de alumnos en CSV: ${alumnos.length}`);

      let creados = 0;
      let existentes = 0;
      let errores = 0;

      for (const alumno of alumnos) {
        try {
          // Validar que el alumno esté matriculado y tenga datos válidos
          if (
            alumno.ESTADO_ACTUAL !== 'Matriculado' ||
            !alumno.RUT ||
            !alumno.CORREO_ALUMNO
          ) {
            continue;
          }

          // Formatear RUT (quitar puntos y guión)
          const rutLimpio = alumno.RUT.replace(/\./g, '').replace(/-/g, '');
          const rut = rutLimpio.slice(0, -1) + '-' + rutLimpio.slice(-1);

          // Construir nombres completos
          const nombres = [alumno.PRIMER_NOMBRE, alumno.SEGUNDO_NOMBRE]
            .filter((n) => n && n.trim())
            .join(' ');
          const apellidos = [alumno.APELLIDOPATERNO, alumno.APELLIDOMATERNO]
            .filter((a) => a && a.trim())
            .join(' ');

          const createDto = {
            rut_alumno: rut,
            nombres: nombres,
            apellidos: apellidos,
            correo: alumno.CORREO_ALUMNO,
            fecha_admision: alumno.ADMISION,
            codigo_carrera: alumno.CODCARRERA,
            nombre_carrera: alumno.NOMBRECARRERA,
            promedio: parseFloat(alumno.PROMEDIO) || 0,
            nivel: parseInt(alumno.NIVEL) || 0,
            periodo: alumno.PERIODO,
          };

          // Verificar si ya existe
          const existe = await alumnoService.findByRut(rut);
          if (!existe) {
            await alumnoService.create(createDto);
            creados++;
            if (creados % 20 === 0) {
              console.log(`   ${creados} alumnos creados...`);
            }
          } else {
            existentes++;
          }
        } catch (error) {
          errores++;
          if (errores <= 5) {
            console.error(
              `   Error con alumno ${alumno.RUT}:`,
              error.message,
            );
          }
        }
      }

      console.log(`\n   Resumen Alumnos:`);
      console.log(`      Creados: ${creados}`);
      console.log(`     ⏭  Ya existían: ${existentes}`);
      console.log(`      Errores: ${errores}`);
    } else {
      console.log(`    Archivo no encontrado: ${alumnosPath}`);
      console.log(`     Coloca el CSV en: backend/data/alumnos.csv`);
    }

    console.log('\n Proceso de seeding completado exitosamente!\n');
  } catch (error) {
    console.error('\n Error durante el seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
