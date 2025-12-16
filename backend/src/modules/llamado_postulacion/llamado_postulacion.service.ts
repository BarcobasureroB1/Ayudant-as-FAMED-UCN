import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';


import { CreateLlamadoPostulacionDto } from './dto/create-llamado-postulacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LlamadoPostulacion } from './entities/llamado_postulacion.entity';
import { Repository, In } from 'typeorm';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Postulacion } from '../postulacion/entities/postulacion.entity';

@Injectable()
export class LlamadoPostulacionService {

  constructor(
    @InjectRepository(LlamadoPostulacion)
    private readonly llamadoPostulacionRepository: Repository<LlamadoPostulacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
  ) {}
  async create(createLlamadoPostulacionDto: CreateLlamadoPostulacionDto) {

    const rutSecretaria = String(createLlamadoPostulacionDto.rut_secretaria);
    const secretaria = await this.usuarioRepository.findOneBy({ rut: rutSecretaria });
    if (!secretaria) {  
      throw new Error('Secretaria no encontrada');
    }
    const asignatura = await this.asignaturaRepository.findOneBy({ id: createLlamadoPostulacionDto.id_asignatura }); 
    if (!asignatura) {
      throw new Error('Asignatura no encontrada');
    }
    // Marcar la asignatura como abierta para postulaciones
    // Establecemos tanto el flag `abierta_postulacion` como el `estado` a 'abierta'
    // para que quede disponible inmediatamente.
    asignatura.abierta_postulacion = true;
    asignatura.estado = 'abierto';
    await this.asignaturaRepository.save(asignatura);
    

    // build payload without the raw rut_secretaria field (we'll set the relation)
    const payload: any = { ...createLlamadoPostulacionDto };
    const descripcionArray: string[] = Array.isArray(payload.descripcion) ? payload.descripcion : [];
    const horariosArray: any[] = Array.isArray(payload.horarios) ? payload.horarios : [];
    const coordinadoresArray: string[] = Array.isArray(payload.coordinadores) ? payload.coordinadores : [];
    delete payload.rut_secretaria;
    delete payload.descripcion;
    delete payload.horarios;
    delete payload.coordinadores;

    // Validaciones de negocio
    // Debe haber al menos un coordinador
    if (!coordinadoresArray || coordinadoresArray.length === 0) {
      throw new BadRequestException('Se requiere al menos un coordinador para el llamado');
    }

    // Si horario_fijo es true, esperamos al menos un horario
    if (payload.horario_fijo && (!horariosArray || horariosArray.length === 0)) {
      throw new Error('Horario fijo indicado pero no se proporcionaron horarios');
    }

    // Validate coordinadores exist and are of type 'coordinador'
    const usuarios = await this.usuarioRepository.find({ where: { rut: In(coordinadoresArray) } });
    if (!usuarios || usuarios.length !== coordinadoresArray.length) {
      throw new NotFoundException('Alguno de los coordinadores no existe');
    }
    const nonCoordinators = usuarios.filter((u) => String(u.tipo).toLowerCase() !== 'coordinador');
    if (nonCoordinators.length > 0) {
      throw new BadRequestException('Uno o más usuarios proporcionados no son coordinadores');
    }

    const entity = this.llamadoPostulacionRepository.create({
      ...payload,
      asignatura,
      secretaria,
      requisitos: descripcionArray.map((d) => ({ descripcion: d })),
      horarios: horariosArray.length > 0 ? horariosArray : null,
      coordinadores: usuarios,
    });

    return await this.llamadoPostulacionRepository.save(entity);
  }

  async findAll() {
    return await this.llamadoPostulacionRepository.find();
  }

  async findOnebyAsignatura(id_asignatura: number) {
    // Include requisitos relation and return descripcion list for each llamado
        const l = await this.llamadoPostulacionRepository.findOne({
          where: { asignatura: { id: id_asignatura }, estado: 'abierto' },
          relations: ['asignatura', 'requisitos', 'coordinadores'],
        });

        if (!l) return null;

        return {
          id: l.id,
          semestre: l.semestre,
          entrega_antecedentes: l.entrega_antecedentes,
          fecha_inicio: l.fecha_inicio,
          fecha_termino: l.fecha_termino,
          tipo_ayudantia: l.tipo_ayudantia,
          tipo_remuneracion: l.tipo_remuneracion,
          horas_mensuales: l.horas_mensuales,
          horario_fijo: l.horario_fijo,
          horarios: l.horarios || [],
          cant_ayudantes: l.cant_ayudantes,
          estado: l.estado,
          descripcion: (l.requisitos || []).map((r) => r.descripcion),
          asignatura: l.asignatura
            ? {
                id: l.asignatura.id,
                nombre: l.asignatura.nombre,
                semestre: l.asignatura.semestre,
                nrc: l.asignatura.nrc,
                estado: l.asignatura.estado,
                abierta_postulacion: l.asignatura.abierta_postulacion,
              }
            : null,
          coordinadores:
            Array.isArray(l.coordinadores) && l.coordinadores.length > 0
              ? l.coordinadores.map((c) => ({ rut: c.rut, nombres: c.nombres, apellidos: c.apellidos }))
              : [],
        };

  }

  async cambiarEstado(id: number) {
    // Obtener el llamado con su asignatura
    const entity = await this.llamadoPostulacionRepository.findOne({
      where: { id },
      relations: ['asignatura'],
    });
    if (!entity) {
      throw new Error('Llamado no encontrado');
    }

    console.log(`[cambiarEstado] Cerrando llamado ID ${id} para asignatura ID ${entity.asignatura?.id}`);

    // Cambiar estado del llamado
    entity.estado = 'cerrado';
    

    return entity;
  }

 

  
}
