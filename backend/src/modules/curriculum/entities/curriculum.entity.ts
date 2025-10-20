import { ActividadesCientifica } from 'src/modules/actividades_cientificas/entities/actividades_cientifica.entity';
import { ActividadesExtracurriculare } from 'src/modules/actividades_extracurriculares/entities/actividades_extracurriculare.entity';
import { AyudantiasCurriculum } from 'src/modules/ayudantias_curriculum/entities/ayudantias_curriculum.entity';
import { TitulosCurso } from 'src/modules/titulos_cursos/entities/titulos_curso.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Curriculum {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToOne(() => Usuario, (usuario) => usuario.rut)
    @JoinColumn({ name: 'rut_alumno' }) // FK en la tabla curriculum
    usuario: Usuario;
    
    @Column()
    nombres: string;
    @Column()
    apellidos: string
    @Column()
    fecha_nacimiento: string;
    @Column()
    comuna: string;
    @Column()
    ciudad: string;
    @Column()
    Num_Celular: string;
    @Column()
    correo: string;
    @Column()
    carrera: string;
    @Column()
    otros : string;
    @OneToMany(() => AyudantiasCurriculum, (ayudantia) => ayudantia.curriculum, { cascade: true })
    ayudantias: AyudantiasCurriculum[];
    @OneToMany(() => ActividadesCientifica, (a) => a.curriculum, { cascade: true })
    actividades_cientificas: ActividadesCientifica[];
    @OneToMany(() => ActividadesExtracurriculare, (a) => a.curriculum, { cascade: true })
    actividades_extracurriculares: ActividadesExtracurriculare[];
    @OneToMany(() => TitulosCurso, (t) => t.curriculum, { cascade: true })
    titulos: TitulosCurso[];
}
