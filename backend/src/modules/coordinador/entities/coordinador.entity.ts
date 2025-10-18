import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Consanguineo } from 'src/modules/consanguineo/entities/consanguineo.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Coordinador {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToMany(() => Usuario, (usuario) => usuario.rut)
    rut_coordinador: string
    @OneToMany(() => Asignatura, (asignatura) => asignatura.id)
    asignaturas: Asignatura[];
    @Column()
    actual: boolean;
    @OneToMany(() => Consanguineo, (consanguineo) => consanguineo.coordinador)
consanguineos: Consanguineo[];

}
