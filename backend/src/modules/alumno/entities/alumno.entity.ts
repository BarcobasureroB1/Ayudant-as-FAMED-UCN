import { Asignatura } from "src/modules/asignatura/entities/asignatura.entity";
import { AsignaturaAlumno } from "src/modules/asignatura_alumno/entities/asignatura_alumno.entity";
import { Column, Double, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Alumno {
    @PrimaryColumn()
    rut_alumno: string;
    @Column()
    nombres:  string;
    @Column()
    apellidos: string;
    @Column()
    correo : string;
    @Column()
    fecha_admision : string;
    @Column()
    codigo_carrera : string;
    @Column()
    nombre_carrera : string;
    @Column()
    promedio: number;
    @Column()
    nivel: number;
    @Column()
    periodo: string;
  @OneToMany(() => AsignaturaAlumno, (aa) => aa.alumno)
  asignaturasAlumno: AsignaturaAlumno[];
   
}