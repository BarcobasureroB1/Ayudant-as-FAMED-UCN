import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Alumno } from 'src/modules/alumno/entities/alumno.entity';

@Entity()
export class AsignaturaAlumno {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Asignatura, (asignatura) => asignatura.asignaturasAlumnos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_asignatura' })
  asignatura: Asignatura;

  @ManyToOne(() => Alumno, (alumno) => alumno.asignaturasAlumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_alumno' })
  alumno: Alumno;

  @Column('double precision')
  nota: number;
}