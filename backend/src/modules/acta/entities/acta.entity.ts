import { Departamento } from 'src/modules/departamento/entities/departamento.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FirmasActa } from 'src/modules/firmas_acta/entities/firmas_acta.entity';
import { ParticipantesActa } from 'src/modules/participantes_acta/entities/participantes_acta.entity';
@Entity()
export class Acta {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    departamento: string;
    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    fecha: string;
    @Column()
    hora_inicio: string;
    @Column()
    hora_fin: string;
    @Column()
    lugar: string;
    @Column()
    rut_secretaria: string;
    @ManyToOne(() => Departamento, (departamento) => departamento.id)
    id_departamento: Departamento;

    
    @OneToMany(() => FirmasActa, (firma) => firma.acta)
    firmas: FirmasActa[];

    @OneToMany(() => ParticipantesActa, (participante) => participante.acta)
    participantes: ParticipantesActa[];

}

