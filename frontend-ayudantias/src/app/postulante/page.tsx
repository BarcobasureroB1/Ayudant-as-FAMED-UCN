"use client";

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useUserProfile, User } from '@/hooks/useUserProfile';
import { useAlumnoProfile, AlumnoData } from '@/hooks/useAlumnoProfile';
import { useComprobarCurriculum, useCrearCurriculum, CurriculumData } from '@/hooks/useCurriculum';
import { useAuth } from '@/context/AuthContext';

interface UserProps {
    user: User;
    alumno?: AlumnoData;
    curriculum?: CurriculumData;
}

export const PostulanteVista = ({user, alumno, curriculum}: UserProps) => {
    const crearCurriculum = useCrearCurriculum();
    const router = useRouter();
    const { setToken } = useAuth();

    const [paso, setPaso] = useState(1);
    const [mostrarPopup, setMostrarPopup] = useState(false);
  
    const [form, setForm] = useState({
        rut_alumno: "",
        nombres: "",
        apellidos:  "",
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

    const logout = () => {
        setToken(null); //elimina la cookie
        router.push('/login');
        router.refresh(); //pa recargar la pagina
    }

    const mostrarCurriculum = () => {
        return (
        <div className="curriculum-container">
            <h2 className="text-xl font-bold mb-4">Curriculum Vitae</h2>
            <p><b>RUT:</b> {curriculum?.rut_alumno}</p>
            <p><b>Nombre:</b> {curriculum?.nombres} {curriculum?.apellidos}</p>
            <p><b>Fecha de nacimiento:</b> {curriculum?.fecha_nacimiento}</p>
            <p><b>Comuna:</b> {curriculum?.comuna}</p>
            <p><b>Ciudad:</b> {curriculum?.ciudad}</p>
            <p><b>Número de celular:</b> {curriculum?.num_celular}</p>
            <p><b>Correo:</b> {curriculum?.correo}</p>
            <p><b>Carrera:</b> {curriculum?.carrera}</p>
            <p><b>Otros:</b> {curriculum?.otros}</p>
        </div>
        );
    }

    {mostrarPopup && (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setMostrarPopup(false)}
        >
            <div
                className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[700px] relative animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                onClick={() => setMostrarPopup(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
                >
                ✕
                </button>

            {mostrarCurriculum()}
            </div>
        </div>
    )}

    
    if (curriculum && alumno) {
        return (
        <div className="perfil-container">
            <h2 className="text-xl font-bold mb-4">Perfil del Postulante</h2>
            <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Cerrar Sesión
            </button>
            <div className="perfil-datos">
                <p><b>RUT:</b> {user.rut}</p>
                <p><b>Nombre:</b> {user.nombres} {user.apellido}</p>
                <p><b>Correo:</b> {curriculum.correo}</p>
                <p><b>Año de ingreso:</b> {alumno.fecha_admision}</p>
                <p><b>Semestre actual:</b> {alumno.nivel}</p>
                <p><b>CV</b></p>
                <button
                    onClick={() => setMostrarPopup(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Ver documento
                </button>
            </div>
        </div>
        );
    }

    if (curriculum && user.tipo === 'admin') {

        return (
        <div className="perfil-container">
            <h2 className="text-xl font-bold mb-4">Perfil del Postulante</h2>
            <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Cerrar Sesión
            </button>
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

            <label htmlFor="rut_alumno">RUT:</label>
            <input id="rut_alumno" name="rut_alumno" value={form.rut_alumno} onChange={handleChange} required />

            <label htmlFor="nombres">Nombres:</label>
            <input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} required />

            <label htmlFor="apellidos">Apellidos:</label>
            <input id="apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} required />

            <label htmlFor="fecha_nacimiento">Fecha de nacimiento:</label>
            <input id="fecha_nacimiento" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} required />

            <label htmlFor="comuna">Comuna:</label>
            <input id="comuna" name="comuna" value={form.comuna} onChange={handleChange} required />

            <label htmlFor="ciudad">Ciudad:</label>
            <input id="ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} required />

            <label htmlFor="num_celular">Número de celular:</label>
            <input id="num_celular" name="num_celular" value={form.num_celular} onChange={handleChange} required />

            <label htmlFor="email">Correo:</label>
            <input id="email" type="email" name="correo" value={form.correo} onChange={handleChange} required />

            <label htmlFor="carrera">Carrera:</label>
            <input id="carrera" name="carrera" value={form.carrera} onChange={handleChange} required />

            <button type="submit">Siguiente</button>
            </form>
        )}

        
        {paso === 2 && (
            <form onSubmit={handleSubmit}>
            <h3>Ayudantías Previas</h3>
            {form.ayudantias.map((a, i) => (
                <div key={`ayudantia-${i}-${a.nombreAsig}`}>
                <input placeholder="Nombre asignatura" name="nombreAsig" value={a.nombreAsig} onChange={(e) => handleArrayChange(e, "ayudantias", i)} />
                <input placeholder="Coordinador" name="coordinador" value={a.coordinador} onChange={(e) => handleArrayChange(e, "ayudantias", i)} />
                <input placeholder="Evaluación" name="evaluacion" value={a.evaluacion} onChange={(e) => handleArrayChange(e, "ayudantias", i)} />
                </div>
            ))}
            <button type="button" onClick={() => addItem("ayudantias", { nombreAsig: "", coordinador: "", evaluacion: "" })}>+</button>

            <h3>Cursos, Títulos y Grados</h3>
            {form.cursos_titulos_grados.map((c, i) => (
                <div key={`curso-${i}-${c.nombre}`}>
                <input placeholder="Nombre" name="nombre" value={c.nombre} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} />
                <input placeholder="Institución" name="institucion" value={c.institucion} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} />
                <input type="date" name="fecha" value={c.fecha} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} />
                </div>
            ))}
            <button type="button" onClick={() => addItem("cursos_titulos_grados", { nombre: "", institucion: "", fecha: "" })}>+</button>

            <h3>Actividades Científicas</h3>
            {form.actividades_cientificas.map((a, i) => (
                <div key={`cientifica-${i}-${a.nombre}`}>
                <input placeholder="Nombre" name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} />
                <input placeholder="Descripción" name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} />
                <input placeholder="Periodo de participación" name="periodoParticipacion" value={a.periodoParticipacion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} />
                </div>
            ))}
            <button type="button" onClick={() => addItem("actividades_cientificas", { nombre: "", descripcion: "", periodoParticipacion: "" })}>+</button>

            <h3>Actividades Extracurriculares</h3>
            {form.actividades_extracurriculares.map((a, i) => (
                <div key={`extracurricular-${i}-${a.nombre}`}>
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

//componente exportado 
export default function PostulantePage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const { data: alumno, isLoading: cargaAlumno} = useAlumnoProfile(user?.rut);
    const { data: curriculum , isLoading: cargaCurriculum } = useComprobarCurriculum(user?.rut);

    const router = useRouter();

    useEffect(() => {
        if (isError || !user) {
            router.push("/login");
        }
    }, [isError, user, router]);

    if (cargauser || cargaCurriculum || cargaAlumno) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return <PostulanteVista user={user} alumno={alumno} curriculum={curriculum}/>;
}