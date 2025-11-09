import { Alumno } from 'src/modules/alumno/entities/alumno.entity';
import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class TitulosCurso {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Usuario, (usuario) => usuario.titulos, { onDelete: 'CASCADE' })
    usuario: Usuario;
    @Column()
    nombre_asig: string;
    @Column()
    n_coordinador: string;
    @Column()
    evaluacion : string;
}
