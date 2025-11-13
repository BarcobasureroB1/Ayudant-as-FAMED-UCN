import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Consanguineo } from 'src/modules/consanguineo/entities/consanguineo.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, OneToOne, JoinColumn,ManyToMany, ManyToOne } from 'typeorm';
@Entity()
export class Coordinador {
    @PrimaryGeneratedColumn()
    id: number;
    // Relación al usuario que representa al coordinador.
    // Usamos el `rut` del usuario como FK en la columna `rut_coordinador`.
    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'rut_coordinador', referencedColumnName: 'rut' })
    usuario: Usuario;   

    @ManyToOne(() => Asignatura, (asignatura) => asignatura.coordinador)
    asignaturas: Asignatura;
    @Column({ default: true })
    actual: boolean;
    @OneToMany(() => Consanguineo, (consanguineo) => consanguineo.coordinador)
    consanguineos: Consanguineo[];

}
