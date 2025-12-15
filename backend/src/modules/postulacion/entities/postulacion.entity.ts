import { Asignatura } from 'src/modules/asignatura/entities/asignatura.entity';
import { Ayudantia } from 'src/modules/ayudantia/entities/ayudantia.entity';
import { Consanguineo } from 'src/modules/consanguineo/entities/consanguineo.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Postulacion {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Usuario, (usuario) => usuario.rut)
    usuario: Usuario;

    @ManyToOne(() => Asignatura, (asignatura) => asignatura.postulaciones)
    asignatura: Asignatura;
    @Column()
    descripcion_carta: string;
    @Column({nullable: true})
    correo_profe : string;
    @Column()
    actividad: string;
    @Column()
    metodologia: string;
    @Column()
    dia : string;
    @Column()
    bloque : string;
    @Column({ default: false })
    cancelada_por_usuario: boolean;
    @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
    puntuacion_etapa1: number;
    @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
    puntuacion_etapa2: number;
    @Column({ default: false })
    rechazada_por_jefatura: boolean;
    @Column({ default: '' })
    motivo_descarte: string;
    @Column({ default: '' })
    fecha_descarte: string;
    @Column({ default: true })
    es_actual: boolean;
    @OneToMany(() => Consanguineo, (consanguineo) => consanguineo.postulacion)
    consanguineos: Consanguineo[];
    
}

