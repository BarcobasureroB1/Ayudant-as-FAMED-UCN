import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class ActividadesCientifica {
    @PrimaryGeneratedColumn()
    id: number;
     @ManyToOne(() => Curriculum, (curriculum) => curriculum.ayudantias, { onDelete: 'CASCADE' })
        curriculum: Curriculum;
    
    @Column()
    nombre : string;
    @Column()
    descripcion : string;
    @Column()
    periodo_participacion : string;
}
