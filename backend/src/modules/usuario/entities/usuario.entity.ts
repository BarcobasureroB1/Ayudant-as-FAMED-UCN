import { ActividadesCientifica } from 'src/modules/actividades_cientificas/entities/actividades_cientifica.entity';
import { ActividadesExtracurriculare } from 'src/modules/actividades_extracurriculares/entities/actividades_extracurriculare.entity';
import { AyudantiasCurriculum } from 'src/modules/ayudantias_curriculum/entities/ayudantias_curriculum.entity';
import { Departamento } from 'src/modules/departamento/entities/departamento.entity';
import { TitulosCurso } from 'src/modules/titulos_cursos/entities/titulos_curso.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
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
    c_ayudantias : number;
    @Column()
    deshabilitado: boolean;
    @ManyToMany((nullable: true) => Departamento, (departamento) => departamento.secretarias)
    departamentos: Departamento[];

    @OneToMany(() => ActividadesCientifica, (actividadesCientifica) => actividadesCientifica.usuario)
    actividades_cientificas: ActividadesCientifica[];
    @OneToMany(() => AyudantiasCurriculum, (ayudantiasCurriculum) => ayudantiasCurriculum.usuario)
    ayudantias: AyudantiasCurriculum[];
    @OneToMany(() => TitulosCurso, (titulosCurso) => titulosCurso.usuario)
    titulos: TitulosCurso[];
    @OneToMany(() => ActividadesExtracurriculare, (actividadesExtracurriculare) => actividadesExtracurriculare.usuario)
    actividades_extracurriculares: ActividadesExtracurriculare[];

}
