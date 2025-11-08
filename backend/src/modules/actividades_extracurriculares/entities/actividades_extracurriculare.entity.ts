import { Alumno } from 'src/modules/alumno/entities/alumno.entity';
import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()

export class ActividadesExtracurriculare {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Alumno, (alumno) => alumno.actividades_extracurriculares, { onDelete: 'CASCADE' })
    alumno: Alumno;
    @Column()
    nombre : string;
    @Column()
    docente : string;
    @Column()
    descripcion : string;
    @Column()
    periodo_participacion : string;

}
