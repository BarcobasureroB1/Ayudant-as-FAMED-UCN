import { AsignaturaAlumno } from 'src/modules/asignatura_alumno/entities/asignatura_alumno.entity';
import { Departamento } from 'src/modules/departamento/entities/departamento.entity';
import { Postulacion } from 'src/modules/postulacion/entities/postulacion.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Asignatura {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    nombre: string;
    @Column({default: "cerrada"})
    estado: string;
    @Column()
    semestre: number;
    @Column()
    nrc: string;
    @ManyToMany(() => Departamento, (departamento) => departamento.asignaturas)
    departamentos: Departamento[];
    
    @OneToMany(() => AsignaturaAlumno, (aa) => aa.asignatura)
    asignaturasAlumnos: AsignaturaAlumno[];
    @OneToMany(() => Postulacion, (postulacion) => postulacion.asignatura)
    postulaciones: Postulacion[];
}


