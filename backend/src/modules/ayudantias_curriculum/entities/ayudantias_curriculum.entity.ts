import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class AyudantiasCurriculum {
    @PrimaryGeneratedColumn()
    id: number;
     @ManyToOne(() => Curriculum, (curriculum) => curriculum.ayudantias, { onDelete: 'CASCADE' })
    curriculum: Curriculum;
    @Column()
    nombre_asig: string;
    @Column()
    n_coordinador: string
    @Column()
    evaluacion: string;
}
