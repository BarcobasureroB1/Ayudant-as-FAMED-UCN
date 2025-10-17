import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()

export class ActividadesExtracurriculare {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToMany(() => Usuario, (usuario) => usuario.rut)
    @JoinTable({ name: 'rut_alumno' })
    usuario: Usuario;
        
    @Column()
    nombre : string;
    @Column()
    docente : string;
    @Column()
    descripcion : string;
    @Column()
    periodo_participacion : string;

}
