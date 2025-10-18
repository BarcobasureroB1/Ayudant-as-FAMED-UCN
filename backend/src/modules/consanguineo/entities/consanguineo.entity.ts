import { Coordinador } from 'src/modules/coordinador/entities/coordinador.entity';
import { Postulacion } from 'src/modules/postulacion/entities/postulacion.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Consanguineo {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => Postulacion, (postulacion) => postulacion.consanguineos)
    @JoinColumn({ name: 'id_postulacion' })
    postulacion: Postulacion;

  @ManyToOne(() => Coordinador, (coordinador) => coordinador.consanguineos)
  @JoinColumn({ name: 'id_coordinador' })
  coordinador: Coordinador;


    @Column()
    consanguineo: boolean;
}
