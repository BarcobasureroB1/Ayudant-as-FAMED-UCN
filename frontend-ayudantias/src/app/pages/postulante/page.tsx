"use client";

import React, { SyntheticEvent, useState } from 'react';
import { useRouter } from "next/navigation";
import { useUserProfile } from '@/app/hooks/useUserProfile';
import { useAlumnoProfile } from '@/app/hooks/useAlumnoProfile';
import { useComprobarCurriculum, useCrearCurriculum } from '@/app/hooks/useCurriculum';

export const PostulanteVista = () => {

    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const { data: alumno, isLoading: cargaAlumno} = useAlumnoProfile(user?.rut);
    const { data: curriculum , isLoading: cargaCurriculum } = useComprobarCurriculum();

    const crearCurriculum = useCrearCurriculum();
    const router = useRouter();

    const [paso, setPaso] = useState(1);
  
    const [form, setForm] = useState({
        rut_alumno: "",
        nombres: "",
        apellidos: "",
        fecha_nacimiento: "",
        comuna: "",
        ciudad: "",
        num_celular: "",
        correo: "",
        carrera: "",
        otros: "",
        ayudantias: [{ nombreAsig: "", coordinador: "", evaluacion: "" }],
        cursos_titulos_grados: [{ nombre: "", institucion: "", fecha: "" }],
        actividades_cientificas: [{ nombre: "", descripcion: "", periodoParticipacion: "" }],
        actividades_extracurriculares: [
        { nombre: "", docenteInstitucion: "", descripcion: "", periodoParticipacion: "" },
        ],
    });

    if (cargauser || cargaCurriculum || cargaAlumno) return <div>Cargando...</div>;
    
    if (isError) {
        router.push("/app");
        return null;
    }


    if (curriculum && alumno) {
        return (
        <div className="perfil-container">
            <h2 className="text-xl font-bold mb-4">Perfil del Postulante</h2>
            <div className="perfil-datos">
            <p><b>RUT:</b> {user.rut}</p>
            <p><b>Nombre:</b> {user.nombres} {user.apellido}</p>
            <p><b>Correo:</b> {curriculum.correo}</p>
            <p><b>Año de ingreso:</b> {alumno.fecha_admision}</p>
            <p><b>Semestre actual:</b> {alumno.nivel}</p>
            </div>
        </div>
        );
    }

    if (curriculum && user.tipo === 'admin') {

        return (
        <div className="perfil-container">
            <h2 className="text-xl font-bold mb-4">Perfil del Postulante</h2>
            <div className="perfil-datos">
            <p><b>RUT:</b> {user.rut}</p>
            <p><b>Nombre:</b> {user.nombres} {user.apellido}</p>
            <p><b>Correo:</b> {curriculum.correo}</p>
            <p><b>Los siguientes datos son exclusivos de los Alumnos: </b></p>
            <p><b>Año de ingreso: vacío</b></p>
            <p><b>Semestre actual: vacío</b></p>
            </div>
        </div>
        );

    }

    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, key: string, index: number) => {
        const newArray = [...(form as any)[key]];
        newArray[index][e.target.name] = e.target.value;
        setForm({ ...form, [key]: newArray });
    };

    const addItem = (key: string, emptyItem: any) => {
        const newArray = [...(form as any)[key], emptyItem];
        setForm({ ...form, [key]: newArray });
    };

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        crearCurriculum.mutate(form);
    };

    return (
        <div className="form-container">
        <h2>Crear Curriculum</h2>

        {paso === 1 && (
            <form
            className="datos-personales"
            onSubmit={(e) => {
                e.preventDefault();
                setPaso(2);
            }}
            >
            <h3>Datos Personales</h3>

            <label>RUT:</label>
            <input name="rut_alumno" value={form.rut_alumno} onChange={handleChange} required />

            <label>Nombres:</label>
            <input name="nombres" value={form.nombres} onChange={handleChange} required />

            <label>Apellidos:</label>
            <input name="apellidos" value={form.apellidos} onChange={handleChange} required />

            <label>Fecha de nacimiento:</label>
            <input name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} required />

            <label>Comuna:</label>
            <input name="comuna" value={form.comuna} onChange={handleChange} required />

            <label>Ciudad:</label>
            <input name="ciudad" value={form.ciudad} onChange={handleChange} required />

            <label>Número de celular:</label>
            <input name="num_celular" value={form.num_celular} onChange={handleChange} required />

            <label>Correo:</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required />

            <label>Carrera:</label>
            <input name="carrera" value={form.carrera} onChange={handleChange} required />

            <button type="submit">Siguiente</button>
            </form>
        )}

        
        {paso === 2 && (
            <form onSubmit={handleSubmit}>
            <h3>Ayudantías Previas</h3>
            {form.ayudantias.map((a, i) => (
                <div key={i}>
                <input placeholder="Nombre asignatura" name="nombreAsig" value={a.nombreAsig} onChange={(e) => handleArrayChange(e, "ayudantias", i)} />
                <input placeholder="Coordinador" name="coordinador" value={a.coordinador} onChange={(e) => handleArrayChange(e, "ayudantias", i)} />
                <input placeholder="Evaluación" name="evaluacion" value={a.evaluacion} onChange={(e) => handleArrayChange(e, "ayudantias", i)} />
                </div>
            ))}
            <button type="button" onClick={() => addItem("ayudantias", { nombreAsig: "", coordinador: "", evaluacion: "" })}>+</button>

            <h3>Cursos, Títulos y Grados</h3>
            {form.cursos_titulos_grados.map((c, i) => (
                <div key={i}>
                <input placeholder="Nombre" name="nombre" value={c.nombre} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} />
                <input placeholder="Institución" name="institucion" value={c.institucion} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} />
                <input type="date" name="fecha" value={c.fecha} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} />
                </div>
            ))}
            <button type="button" onClick={() => addItem("cursos_titulos_grados", { nombre: "", institucion: "", fecha: "" })}>+</button>

            <h3>Actividades Científicas</h3>
            {form.actividades_cientificas.map((a, i) => (
                <div key={i}>
                <input placeholder="Nombre" name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} />
                <input placeholder="Descripción" name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} />
                <input placeholder="Periodo de participación" name="periodoParticipacion" value={a.periodoParticipacion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} />
                </div>
            ))}
            <button type="button" onClick={() => addItem("actividades_cientificas", { nombre: "", descripcion: "", periodoParticipacion: "" })}>+</button>

            <h3>Actividades Extracurriculares</h3>
            {form.actividades_extracurriculares.map((a, i) => (
                <div key={i}>
                <input placeholder="Nombre" name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} />
                <input placeholder="Docente o institución" name="docenteInstitucion" value={a.docenteInstitucion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} />
                <input placeholder="Descripción" name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} />
                <input placeholder="Periodo de participación" name="periodoParticipacion" value={a.periodoParticipacion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} />
                </div>
            ))}
            <button type="button" onClick={() => addItem("actividades_extracurriculares", { nombre: "", docenteInstitucion: "", descripcion: "", periodoParticipacion: "" })}>+</button>

            <h3>Otros</h3>
            <textarea name="otros" value={form.otros} onChange={handleChange} />

            <button type="submit">Guardar Curriculum</button>
            </form>
        )}
        </div>
    );
};