import { ActividadesCientifica } from 'src/modules/actividades_cientificas/entities/actividades_cientifica.entity';
import { ActividadesExtracurriculare } from 'src/modules/actividades_extracurriculares/entities/actividades_extracurriculare.entity';
import { Ayudantia } from 'src/modules/ayudantia/entities/ayudantia.entity';
import { AyudantiasCurriculum } from 'src/modules/ayudantias_curriculum/entities/ayudantias_curriculum.entity';
import { Departamento } from 'src/modules/departamento/entities/departamento.entity';
import { Postulacion } from 'src/modules/postulacion/entities/postulacion.entity';
import { TitulosCurso } from 'src/modules/titulos_cursos/entities/titulos_curso.entity';
import { Coordinador } from 'src/modules/coordinador/entities/coordinador.entity';
import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
@Entity()
export class Usuario {
    @PrimaryColumn()
    rut: string;
    @Column({nullable: false})
    nombres: string;
    @Column({nullable: false})
    apellidos: string
    @Column({nullable: false})
    password: string;
    @Column()
    tipo: string;
    @Column({nullable: true})
    correo: string
    @Column({nullable: true, default : 0})
    c_ayudantias : number;
    @Column()
    deshabilitado: boolean;
    @ManyToMany((nullable: true) => Departamento, (departamento) => departamento.secretarias)
    departamentos: Departamento[];
    @OneToMany(() => AyudantiasCurriculum, (ayudantia) => ayudantia.usuario)
    ayudantias: AyudantiasCurriculum[];
    @OneToMany(() => TitulosCurso, (titulos) => titulos.usuario)
    titulos: TitulosCurso[];
    @OneToMany(() => Ayudantia, (ayudantia) => ayudantia.alumno)
    ayudantias_como_alumno: Ayudantia[];
    @OneToMany(() => ActividadesCientifica, (actividades) => actividades.usuario)
    actividades_cientificas: ActividadesCientifica[];
    @OneToMany(() => ActividadesExtracurriculare, (actividades) => actividades.usuario)
  actividades_extracurriculares: ActividadesExtracurriculare[];
    @OneToMany(() => Ayudantia, (ayudantia) => ayudantia.coordinador)
    ayudantias_como_coordinador: Ayudantia[];
    @OneToMany(() => Postulacion, (postulacion) => postulacion.usuario)
    postulaciones: Postulacion[];
    @OneToMany(() => Coordinador, (coordinador) => coordinador.usuario)
    coordinador: Coordinador []; 


}
