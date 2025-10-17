import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Departamento {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    nombre: string

    @ManyToMany(() => Usuario, (usuario) => usuario.departamentos)
    @JoinTable({
    name: 'departamentos_secretaria',
    joinColumn: { name: 'id_departamento', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rut_secretaria', referencedColumnName: 'rut' },
    })
    secretarias: Usuario[];

    @ManyToMany(() => Asignatura, (asignatura) => asignatura.departamentos)
    @JoinTable({
  name: 'departamentos_asignaturas',
  joinColumn: { name: 'id_departamento', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'id_asignatura', referencedColumnName: 'id' },
    })
    asignaturas: Asignatura[];
}

