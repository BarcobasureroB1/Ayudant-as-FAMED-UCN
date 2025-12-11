import { Departamento } from 'src/modules/departamento/entities/departamento.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Acta {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    departamento: string;
    @Column(type => Date)
    fecha: Date;
    @Column()
    hora_inicio: string;
    @Column()
    hora_fin: string;
    @Column()
    lugar: string;
    @ManyToOne(() => Departamento, (departamento) => departamento.id)
    id_departamento: Departamento;

}

