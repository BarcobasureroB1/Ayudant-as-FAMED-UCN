import { LlamadoPostulacion } from './llamado_postulacion.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'requisito_extra' })
export class RequisitoExtra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  descripcion: string;

  @ManyToOne(() => LlamadoPostulacion)
  @JoinColumn({ name: 'id_llamado', referencedColumnName: 'id' })
  llamado: LlamadoPostulacion;
}
