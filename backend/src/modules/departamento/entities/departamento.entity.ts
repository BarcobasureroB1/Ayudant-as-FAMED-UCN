import { Acta } from 'src/modules/acta/entities/acta.entity';
import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Departamento {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    nombre: string

    @OneToMany(() => Acta, (acta) => acta.id_departamento)
    actas: Acta[];

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

