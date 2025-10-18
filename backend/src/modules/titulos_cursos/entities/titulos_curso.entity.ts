import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class TitulosCurso {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Curriculum, (curriculum) => curriculum.titulos, { onDelete: 'CASCADE' })
    curriculum: Curriculum;
    @Column()
    rut_alumno: string;
    @Column()
    nombre : string;
    @Column()
    institucion : string;
    @Column()
    ano : string;
}
