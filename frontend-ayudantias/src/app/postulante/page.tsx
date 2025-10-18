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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Perfil del Postulante</h2>
                    <button onClick={logout} className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded transition duration-200">
                        Cerrar Sesión
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <p><b>RUT:</b> {user.rut}</p>
                    <p><b>Nombre:</b> {user.nombres} {user.apellido}</p>
                    <p><b>Correo:</b> {curriculum.correo}</p>
                    <p><b>Año de ingreso:</b> {alumno.fecha_admision}</p>
                    <p><b>Semestre actual:</b> {alumno.nivel}</p>
                </div>
                <div className="mt-4">
                    <button onClick={() => setMostrarPopup(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Ver documento
                    </button>
                </div>
            </div>       
        </div>
        );
    }

    if (curriculum && user.tipo === 'admin') {

        return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Perfil del Postulante</h2>
                    <button onClick={logout} className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded transition duration-200">
                        Cerrar Sesión
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><b>RUT:</b> {user.rut}</p>
                    <p><b>Nombre:</b> {user.nombres} {user.apellido}</p>
                    <p><b>Correo:</b> {curriculum.correo}</p>
                    <p><b>Los siguientes datos son exclusivos de los Alumnos:</b></p>
                    <p><b>Año de ingreso:</b> vacío</p>
                    <p><b>Semestre actual:</b> vacío</p>
                </div>
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

    //pa eliminar algun campo agregado al form en la fase 2
    const removeItem = (key: string, index: number) => {
        const newArray = (form as any)[key].filter((_: any, i: number) => i !== index);
        setForm({ ...form, [key]: newArray });
    };

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        crearCurriculum.mutate(form);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Crear Curriculum</h2>
                    <button onClick={logout} className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded transition duration-200">
                        Cerrar Sesión
                    </button>
                </div>

                {paso === 1 && (
                    <form
                        className="space-y-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setPaso(2);
                        }}
                    >
                        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">Datos Personales</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="rut_alumno" className="block text-sm font-medium text-gray-700 mb-1">RUT:</label>
                                <input id="rut_alumno" name="rut_alumno" value={form.rut_alumno} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                            </div>

                            <div>
                                <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">Nombres:</label>
                                <input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                            </div>

                            <div>
                                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">Apellidos:</label>
                                <input id="apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                            </div>

                            <div>
                                <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento:</label>
                                <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                            </div>

                            <div>
                                <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">Comuna:</label>
                                <input id="comuna" name="comuna" value={form.comuna} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                            </div>

                            <div>
                                <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-1">Ciudad:</label>
                                <input id="ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                            </div>

                            <div>
                                <label htmlFor="num_celular" className="block text-sm font-medium text-gray-700 mb-1">Número de celular:</label>
                                <input id="num_celular" name="num_celular" value={form.num_celular} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo:</label>
                                <input id="email" type="email" name="correo" value={form.correo} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="carrera" className="block text-sm font-medium text-gray-700 mb-1">Carrera:</label>
                                <input id="carrera" name="carrera" value={form.carrera} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition duration-200">
                                Siguiente
                            </button>
                        </div>
                    </form>
                )}

                {paso === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">Datos academicos y profesionales</h3>
                        
                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Ayudantías Previas</h4>
                            {form.ayudantias.map((a, i) => (
                                <div key={`ayudantia-${i}-${a.nombreAsig}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded bg-gray-50">
                                    <input placeholder="Nombre asignatura" name="nombreAsig" value={a.nombreAsig} onChange={(e) => handleArrayChange(e, "ayudantias", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Coordinador" name="coordinador" value={a.coordinador} onChange={(e) => handleArrayChange(e, "ayudantias", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Evaluación" name="evaluacion" value={a.evaluacion} onChange={(e) => handleArrayChange(e, "ayudantias", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <button type="button" onClick={() => removeItem("ayudantias", i)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm">
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem("ayudantias", { nombreAsig: "", coordinador: "", evaluacion: "" })} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium">
                                + Agregar Ayudantía
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Cursos, Títulos y Grados</h4>
                            {form.cursos_titulos_grados.map((c, i) => (
                                <div key={`curso-${i}-${c.nombre}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded bg-gray-50">
                                    <input placeholder="Nombre" name="nombre" value={c.nombre} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Institución" name="institucion" value={c.institucion} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input type="date" name="fecha" value={c.fecha} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <button type="button" onClick={() => removeItem("cursos_titulos_grados", i)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm">
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem("cursos_titulos_grados", { nombre: "", institucion: "", fecha: "" })} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium">
                                + Agregar Curso/Título
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Actividades Científicas</h4>
                            {form.actividades_cientificas.map((a, i) => (
                                <div key={`cientifica-${i}-${a.nombre}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded bg-gray-50">
                                    <input placeholder="Nombre" name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Descripción" name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Periodo de participación" name="periodoParticipacion" value={a.periodoParticipacion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <button type="button" onClick={() => removeItem("actividades_cientificas", i)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm">
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem("actividades_cientificas", { nombre: "", descripcion: "", periodoParticipacion: "" })} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium">
                                + Agregar Actividad Científica
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Actividades Extracurriculares</h4>
                            {form.actividades_extracurriculares.map((a, i) => (
                                <div key={`extracurricular-${i}-${a.nombre}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-3 border rounded bg-gray-50">
                                    <input placeholder="Nombre" name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Docente o institución" name="docenteInstitucion" value={a.docenteInstitucion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Descripción" name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Periodo de participación" name="periodoParticipacion" value={a.periodoParticipacion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <button type="button" onClick={() => removeItem("actividades_extracurriculares", i)}className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm">
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem("actividades_extracurriculares", { nombre: "", docenteInstitucion: "", descripcion: "", periodoParticipacion: "" })} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium">
                                + Agregar Actividad Extracurricular
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Otros</h4>
                            <textarea name="otros" value={form.otros} onChange={handleChange} placeholder="Información adicional que consideres relevante..." className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-24 text-gray-800"/>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button type="button" onClick={() => setPaso(1)} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition duration-200">
                                Anterior
                            </button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition duration-200">
                                Guardar Curriculum
                            </button>
                        </div>
                    </form>
                )}
            </div>
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