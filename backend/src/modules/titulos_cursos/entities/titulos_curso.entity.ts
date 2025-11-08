import { Alumno } from 'src/modules/alumno/entities/alumno.entity';
import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class TitulosCurso {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Alumno, (alumno) => alumno.titulos, { onDelete: 'CASCADE' })
    alumno: Alumno;
    @Column()
    nombre_asig: string;
    @Column()
    n_coordinador: string;
    @Column()
    evaluacion : string;
}
