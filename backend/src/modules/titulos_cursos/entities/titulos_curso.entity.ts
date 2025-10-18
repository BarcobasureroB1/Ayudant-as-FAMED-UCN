import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class TitulosCurso {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToMany(() => Usuario, (usuario) => usuario.rut)
    @JoinColumn({ name: 'rut_alumno' })
    usuario: Usuario;
    rut_alumno: string;
    @Column()
    nombre : string;
    @Column()
    institucion : string;
    @Column()
    ano : string;
}
