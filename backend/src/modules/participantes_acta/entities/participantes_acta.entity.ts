import { Acta } from 'src/modules/acta/entities/acta.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class ParticipantesActa {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Acta, (acta) => acta.id)
    acta: Acta;
    @Column()
    nombre : string;
    @Column()
    cargo : string;
    @Column()
    correo : string;
    
}
