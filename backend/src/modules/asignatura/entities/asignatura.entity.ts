import { AsignaturaAlumno } from 'src/modules/asignatura_alumno/entities/asignatura_alumno.entity';
import { Coordinador } from 'src/modules/coordinador/entities/coordinador.entity';
import { Departamento } from 'src/modules/departamento/entities/departamento.entity';
import { Postulacion } from 'src/modules/postulacion/entities/postulacion.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { JoinColumn } from 'typeorm';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
@Entity()
export class Asignatura {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    nombre: string;
    @Column({default: "cerrado"})
    estado: string;
    @Column()
    semestre: number;
    @Column()
    nrc: string;
    @Column({ default: false })
    abierta_postulacion: boolean;
    @ManyToMany(() => Departamento, (departamento) => departamento.asignaturas)
    departamentos: Departamento[];
    
    @OneToMany(() => AsignaturaAlumno, (aa) => aa.asignatura)
    asignaturasAlumnos: AsignaturaAlumno[];
    @OneToMany(() => Postulacion, (postulacion) => postulacion.asignatura)
    postulaciones: Postulacion[];
    
    @OneToMany(() => Coordinador, (coordinador) => coordinador.asignaturas)
    coordinador?: Coordinador[];
}
    

