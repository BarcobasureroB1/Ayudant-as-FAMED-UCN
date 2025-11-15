import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RequisitoExtra } from './requisito_extra.entity';

@Entity({ name: 'llamado_postulacion' })
export class LlamadoPostulacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Asignatura)
  @JoinColumn({ name: 'id_asignatura', referencedColumnName: 'id' })
  asignatura: Asignatura;

  @Column()
  semestre: string;

  @Column({ type: 'date' })
  entrega_antecedentes: string;

  @Column({ type: 'date' })
  fecha_inicio: string;

  @Column({ type: 'date' })
  fecha_termino: string;

  @Column()
  tipo_ayudantia: string;

  @Column()
  tipo_remuneracion: string;

  @Column()
  horas_mensuales: number;

  @Column()
  horario_fijo: boolean;

  @Column()
  cant_ayudantes: number;

  @Column()
  estado: string;
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'rut_secretaria', referencedColumnName: 'rut' })
  secretaria: Usuario;

  @OneToMany(() => RequisitoExtra, (r) => r.llamado, { cascade: true })
  requisitos?: RequisitoExtra[];
}

