import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
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

  @Column({ type: 'json', nullable: true })
  horarios?: { dia: string; bloque: string }[];

  @Column()
  cant_ayudantes: number;

  @Column({default: 'abierto'})
  estado: string;
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'rut_secretaria', referencedColumnName: 'rut' })
  secretaria: Usuario;

  @OneToMany(() => RequisitoExtra, (r) => r.llamado, { cascade: true })
  requisitos?: RequisitoExtra[];

  // Relación a usuarios que actúan como coordinadores sugeridos para este llamado
  @ManyToMany(() => Usuario)
  @JoinTable({
    name: 'llamado_coordinador',
    joinColumn: { name: 'llamado_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rut_coordinador', referencedColumnName: 'rut' },
  })
  coordinadores?: Usuario[];
}

