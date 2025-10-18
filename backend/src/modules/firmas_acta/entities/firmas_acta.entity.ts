import { Acta } from 'src/modules/acta/entities/acta.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class FirmasActa {
    @PrimaryGeneratedColumn()
    id: number; 
    @ManyToOne(() => Acta, (acta) => acta.id)
    acta: Acta;
    @Column()
    nombre : string;
    @Column()
    cargo : string
}
