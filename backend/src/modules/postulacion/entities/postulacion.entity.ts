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

    @ManyToOne(() => Ayudantia, (ayudantia) => ayudantia.postulacion)
    ayudantia: Ayudantia;
    @Column()
    descripcion_carta: string;
    @Column()
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
    @Column()
    puntuacion_etapa1: number;
    @Column()
    puntuacion_etapa2: number;
    @Column({ default: false })
    rechazada_por_jefatura: boolean;
    @Column()
    motivo_descarte: string;
    @Column()
    fecha_descarte: string;
    @Column({ default: true })
    es_actual: boolean;
    @OneToMany(() => Consanguineo, (consanguineo) => consanguineo.postulacion)
    consanguineos: Consanguineo[];
    
}

