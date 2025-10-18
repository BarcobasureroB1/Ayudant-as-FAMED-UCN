import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Curriculum {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToOne(() => Usuario, (usuario) => usuario.rut)
    @JoinColumn({ name: 'rut_alumno' }) // FK en la tabla curriculum
    usuario: Usuario;
    
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
