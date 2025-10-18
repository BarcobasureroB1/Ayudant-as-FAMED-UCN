import { Departamento } from 'src/modules/departamento/entities/departamento.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
@Entity()
export class Usuario {
    @PrimaryColumn()
    rut: string;
    @Column({nullable: false})
    nombres: string;
    @Column({nullable: false})
    apellidos: string
    @Column({nullable: false})
    password: string;
    @Column()
    tipo: string;
    @Column({nullable: true})
    c_ayudantias : number;
    @Column()
    deshabilitado: boolean;
    @ManyToMany((nullable: true) => Departamento, (departamento) => departamento.secretarias)
    departamentos: Departamento[];


}
