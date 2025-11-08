import { ActividadesCientifica } from "src/modules/actividades_cientificas/entities/actividades_cientifica.entity";
import { ActividadesExtracurriculare } from "src/modules/actividades_extracurriculares/entities/actividades_extracurriculare.entity";
import { Asignatura } from "src/modules/asignatura/entities/asignatura.entity";
import { AsignaturaAlumno } from "src/modules/asignatura_alumno/entities/asignatura_alumno.entity";
import { AyudantiasCurriculum } from "src/modules/ayudantias_curriculum/entities/ayudantias_curriculum.entity";
import { TitulosCurso } from "src/modules/titulos_cursos/entities/titulos_curso.entity";
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
    @Column({ type: 'float' })
    promedio: number;
    @Column()
    nivel: number;
    @Column()
    periodo: string;
  @OneToMany(() => AsignaturaAlumno, (aa) => aa.alumno)
  asignaturasAlumno: AsignaturaAlumno[];
  @OneToMany(() => AyudantiasCurriculum, (ayudantia) => ayudantia.alumno)
  ayudantias: AyudantiasCurriculum[];
  @OneToMany(() => TitulosCurso, (titulos) => titulos.alumno)
  titulos: TitulosCurso[];
  @OneToMany(() => ActividadesCientifica, (actividades) => actividades.alumno)
  actividades_cientificas: ActividadesCientifica[];
  @OneToMany(() => ActividadesExtracurriculare, (actividades) => actividades.alumno)
  actividades_extracurriculares: ActividadesExtracurriculare[];
}