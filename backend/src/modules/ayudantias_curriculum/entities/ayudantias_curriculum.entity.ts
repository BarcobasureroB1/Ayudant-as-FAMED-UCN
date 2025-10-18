import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class AyudantiasCurriculum {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToMany(() => Usuario, (usuario) => usuario.rut)
    rut_alumno: string
    @Column()
    nombre_asig: string;
    @Column()
    n_coordinador: string
    @Column()
    evaluacion: string;
}
