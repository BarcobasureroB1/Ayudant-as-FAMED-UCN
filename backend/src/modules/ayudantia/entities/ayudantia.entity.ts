import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Postulacion } from 'src/modules/postulacion/entities/postulacion.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Ayudantia {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'rut_alumno', referencedColumnName: 'rut' })
    alumno: Usuario;
     @ManyToOne(() => Asignatura)
    @JoinColumn({ name: 'id_asignatura', referencedColumnName: 'id' })
    asignatura: Asignatura;
    @Column( { default: 0 } )
    evaluacion: number;
    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'rut_coordinador_otro', referencedColumnName: 'rut' })
    coordinador: Usuario;
    @Column()
    periodo: string;
    @Column()
    remunerada: string;
    @Column({default: 'Ayudantia Docente'})
    tipo_ayudantia: string;

    

}
