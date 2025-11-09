import { Alumno } from 'src/modules/alumno/entities/alumno.entity';
import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class ActividadesCientifica {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Usuario, (usuario) => usuario.actividades_cientificas, { onDelete: 'CASCADE' })
    usuario: Usuario;

    @Column()
    nombre : string;
    @Column()
    descripcion : string;
    @Column()
    periodo_participacion : string;
}
