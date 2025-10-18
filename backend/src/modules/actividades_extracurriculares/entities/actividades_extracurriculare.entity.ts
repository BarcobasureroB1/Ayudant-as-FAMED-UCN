import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()

export class ActividadesExtracurriculare {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToMany(() => Usuario, (usuario) => usuario.rut)
    @JoinTable({ name: 'rut_alumno' })
    usuario: Usuario;
    @ManyToOne(() => Curriculum, (curriculum) => curriculum.actividades_extracurriculares, { onDelete: 'CASCADE' })
    curriculum: Curriculum;
    @Column()
    nombre : string;
    @Column()
    docente : string;
    @Column()
    descripcion : string;
    @Column()
    periodo_participacion : string;

}
