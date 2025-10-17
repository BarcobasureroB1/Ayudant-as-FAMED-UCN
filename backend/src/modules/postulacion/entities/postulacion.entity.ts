import { Consanguineo } from 'src/modules/consanguineo/entities/consanguineo.entity';
import { Usuario } from 'src/modules/usuario/entities/usuario.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Postulacion {
    @PrimaryGeneratedColumn()
    id: number;
    @OneToMany(() => Usuario, (usuario) => usuario.rut)
    rut_alumno: string;
    @Column()
    asignatura: string;
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
    @Column()
    cancelada : boolean;
    @Column()
    puntuacion : number;
    @Column()
    puntuacion_2 : number;

    @OneToMany(() => Consanguineo, (consanguineo) => consanguineo.postulacion)
consanguineos: Consanguineo[];
    
}

