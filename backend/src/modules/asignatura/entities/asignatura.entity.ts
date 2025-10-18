import { Departamento } from 'src/modules/departamento/entities/departamento.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Asignatura {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    nombre: string;
    @Column()
    estado: string;
    @Column()
    semestre: number;
    @Column()
    nrc: string;
    @ManyToMany(() => Departamento, (departamento) => departamento.asignaturas)
    departamentos: Departamento[];
}


