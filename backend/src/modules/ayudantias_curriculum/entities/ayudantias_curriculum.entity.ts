import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Postulacion } from 'src/modules/postulacion/entities/postulacion.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class AyudantiasCurriculum {
    @PrimaryGeneratedColumn()
    id: number;
     @ManyToOne(() => Usuario, (usuario) => usuario.ayudantias, { onDelete: 'CASCADE' })
    usuario: Usuario;
    @Column()
    nombre_asig: string;
    @Column()
    nombre_coordinador: string
    @Column()
    evaluacion: string;
    
}
