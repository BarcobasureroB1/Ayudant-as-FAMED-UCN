
import { Alumno } from 'src/modules/alumno/entities/alumno.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Curriculum {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToOne(() => Alumno, (alumno) => alumno.rut_alumno)
    @JoinColumn({ name: 'rut_alumno' }) // FK en la tabla curriculum
    alumno: Alumno;

    @Column()
    nombres: string;
    @Column()
    apellidos: string
    @Column()
    fecha_nacimiento: string;
    @Column()
    comuna: string;
    @Column()
    ciudad: string;
    @Column()
    Num_Celular: string;
    @Column()
    correo: string;
    @Column()
    carrera: string;
    @Column()
    otros : string;
 
}
