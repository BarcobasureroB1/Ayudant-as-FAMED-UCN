import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Ayudantia {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToOne(() => Usuario, (usuario) => usuario.rut)
    usuario: Usuario;
    @OneToOne(() => Asignatura, (asignatura) => asignatura.id)
    asignatura: Asignatura;
    @Column()
    evaluacion: string;
    @Column()
    @OneToOne(() => Usuario, (usuario) => usuario.rut)
    rut_coordinador: string;
    @Column()
    periodo: string;
    @Column()
    remunerada: string;

}
