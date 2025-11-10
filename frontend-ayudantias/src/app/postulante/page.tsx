/*"use client";

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useUserProfile, User } from '@/hooks/useUserProfile';
import { useAlumnoProfile, AlumnoData } from '@/hooks/useAlumnoProfile';
import { useComprobarCurriculum, useCrearCurriculum, useActividadesExtracurriculares, useActividadescientificas, useCursos_titulos_grados, useAyudantias, CurriculumResponse} from '@/hooks/useCurriculum';
import { useAuth } from '@/context/AuthContext';
import { AyudantiasAnteriores, useAyudantiasPorAlumno } from '@/hooks/useAyudantia';
import { PostulacionData, usePostulacionesPorAlumno, useCancelarPostulacion, useCrearPostulacion } from '@/hooks/usePostulacion';
import { useAsignaturasDisponiblesPostulacion, useTodasAsignaturas } from '@/hooks/useAsignaturas';
import Cookies from 'js-cookie';

interface UserProps {
    user: User;
    alumno?: AlumnoData;
    curriculum?: CurriculumResponse;
    actividadesExtracurriculares?: any;
    actividadesCientificas?: any;
    cursosTitulosGrados?: any;
    ayudantias?: any;
    ayudantiasAnteriores?: any;
    postulaciones?: any;
    cancelarPostulacion?: any;
    asignaturasDisponibles?: any;
    asignaturasTodas?: any;
}

export const PostulanteVista = ({user, alumno, curriculum, actividadesExtracurriculares, actividadesCientificas, cursosTitulosGrados, ayudantias, ayudantiasAnteriores, postulaciones, cancelarPostulacion, asignaturasDisponibles, asignaturasTodas}: UserProps) => {
    const crearCurriculum = useCrearCurriculum();
    const crearPostulacion = useCrearPostulacion();
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    type Vista = 'perfil' | 'postular';
    const [paso, setPaso] = useState<number>(1);
    const [mostrarPopup, setMostrarPopup] = useState<boolean>(false);
    const [mostrarPopupPostulaciones, setMostrarPopupPostulaciones] = useState<boolean>(false);
    const [postulacionSeleccionada, setPostulacionSeleccionada] = useState<any>(null);
    const [vista, setVista] = useState<Vista>('perfil');
    const isPerfil = vista === 'perfil';
    const isPostular = vista === 'postular';
  
    const [form, setForm] = useState({
        rut_alumno: user.rut || "",
        nombres: "",
        apellidos:  "",
        fecha_nacimiento: "",
        comuna: "",
        ciudad: "",
        num_celular: "",
        correo: "",
        carrera: "",
        otros: "",
        ayudantias: [{ nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" }],
        cursos_titulos_grados: [{ nombre_asig: "", n_coordinador: "", evaluacion: "" }],
        actividades_cientificas: [{ nombre: "", descripcion: "", periodo_participacion: "" }],
        actividades_extracurriculares: [
        { nombre: "", docente: "", descripcion: "", periodo_participacion: "" },
        ],
    });

    const [formPostulacion, setFormPostulacion] = useState({
        rut_alumno: "",
        id_asignatura: "",
        nombre_asignatura: "",
        descripcion_carta: "",
        correo_profe: "",
        actividad: "",
        metodologia: "",
        dia: "",
        bloque: "",
    });

    const logout = () => {
        setToken(null); //elimina la cookie
        setUsertipo(null);
        Cookies.remove('token');
        Cookies.remove('tipoUser');
        router.push('/login');
        router.refresh(); //pa recargar la pagina
    }

    const mostrarCurriculum = () => {
        return (
        <div className="text-black"> 
            <h2 className="text-xl font-bold mb-4 ">Curriculum Vitae</h2>
            <p><b>RUT:</b> {curriculum?.usuario.rut}</p>
            <p><b>Nombre:</b> {curriculum?.nombres} {curriculum?.apellidos}</p>
            <p><b>Fecha de nacimiento:</b> {curriculum?.fecha_nacimiento}</p>
            <p><b>Comuna:</b> {curriculum?.comuna}</p>
            <p><b>Ciudad:</b> {curriculum?.ciudad}</p>
            <p><b>Número de celular:</b> {curriculum?.Num_Celular}</p>
            <p><b>Correo:</b> {curriculum?.correo}</p>
            <p><b>Carrera:</b> {curriculum?.carrera}</p>
            <p><b>Otros:</b> {curriculum?.otros}</p>

            {ayudantias && Array.isArray(ayudantias) && ayudantias.length > 0 ? (
                <div>
                    <h3>Ayudantías Currículum</h3>
                    <ul>
                        {ayudantias.map((a: any) => (
                        <li key={a.id}>
                            <p><b>Asignatura:</b> {a.nombre_asig}</p>
                            <p><b>Coordinador:</b> {a.nombre_coordinador}</p>
                            <p><b>Evaluación obtenida:</b> {a.evaluacion}</p>
                        </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No hay ayudantias.</p>
            )}

            {ayudantiasAnteriores && Array.isArray(ayudantiasAnteriores) && ayudantiasAnteriores.length > 0 ? (
                <div>
                <h3>Ayudantías Anteriores</h3>
                <ul>
                    {ayudantiasAnteriores.map((a: AyudantiasAnteriores) => (
                    <li key={a.id}>
                        <p><b>Asignatura: </b> {a.nombre_asig}</p>
                        <p><b>Coordinador: </b> {a.n_coordinador} <b>rut: </b>{a.rut_coordinador_otro}</p>
                        <p><b>Evaluación obtenida: </b> {a.evaluacion}</p>
                    </li>
                    ))}
                </ul>
                </div>
            ) : (
                <p>No hay ayudantias anteriores.</p>
            )}

            {cursosTitulosGrados && Array.isArray(cursosTitulosGrados) && cursosTitulosGrados.length > 0 ? (
                <div>
                <h3>Cursos, Títulos y Grados</h3>
                <ul>
                    {cursosTitulosGrados.map((c: any) => (
                    <li key={c.id}>
                        <p><b>Nombre:</b> {c.nombre_asig}</p>
                        <p><b>Coordinador:</b> {c.n_coordinador}</p>
                        <p><b>Evaluación:</b> {c.evaluacion}</p>
                    </li>
                    ))}
                </ul>
                </div>
            ) : (
                <p>No hay cursos, Titulos o grados.</p>
            )}


            {actividadesCientificas && Array.isArray(actividadesCientificas) && actividadesCientificas.length > 0 ? (
                <div>
                <h3>Actividades Científicas</h3>
                <ul>
                    {actividadesCientificas.map((a: any) => (
                    <li key={a.id}>
                        <p><b>Nombre:</b> {a.nombre}</p>
                        <p><b>Descripción:</b> {a.descripcion}</p>
                        <p><b>Periodo de participación:</b> {a.periodo_participacion}</p>
                    </li>
                    ))}
                </ul>
                </div>
            ): (
                <p>No hay actividades cientificas.</p>
            )}


            {actividadesExtracurriculares && Array.isArray(actividadesExtracurriculares) && actividadesExtracurriculares.length > 0 ? (
                <div>
                <h3>Actividades Extracurriculares</h3>
                <ul>
                    {actividadesExtracurriculares.map((a: any) => (
                    <li key={a.id}>
                        <p><b>Nombre:</b> {a.nombre}</p>
                        <p><b>Docente:</b> {a.docente}</p>
                        <p><b>Descripción:</b> {a.descripcion}</p>
                        <p><b>Periodo de participación:</b> {a.periodo_participacion}</p>
                    </li>
                    ))}
                </ul>
                </div>
            ): (
                <p>No hay actividades extracurriculares</p>
            )}

        </div>
        );
    }

    const mostrarPostulacion = () => {
        if (!postulacionSeleccionada) return null;  
        return (
            <div>
                <h2 className="text-xl font-bold mb-4">Postulación</h2>
                <p><b>Asignatura:</b> {postulacionSeleccionada.nombre_asignatura}</p>
                <p><b>Descripción carta:</b> {postulacionSeleccionada.descripcion_carta}</p>
                <p><b>Correo del profesor:</b> {postulacionSeleccionada.correo_profe}</p>
                <p><b>Actividad:</b> {postulacionSeleccionada.actividad}</p>
                <p><b>Metodología:</b> {postulacionSeleccionada.metodologia}</p>
                <p><b>Día:</b> {postulacionSeleccionada.dia}</p>
                <p><b>Bloque:</b> {postulacionSeleccionada.bloque}</p>
            </div>
        );
    }

    const handleSubmitPostulacion = (e: SyntheticEvent) => {
        e.preventDefault();
        
        crearPostulacion.mutate({ ...formPostulacion, rut_alumno: user.rut });
        
        setFormPostulacion({
            rut_alumno: "",
            id_asignatura: "",
            nombre_asignatura: "",
            descripcion_carta: "",
            correo_profe: "",
            actividad: "",
            metodologia: "",
            dia: "",
            bloque: "",
        });
    };

    
    const popupCurriculum = mostrarPopup ? (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setMostrarPopup(false)}
        >
            <div
                className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[700px] relative animate-fadeIn max-h-[80vh] overflow-y-auto"
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
    ) : null;

    const popupPostulacion = (mostrarPopupPostulaciones && postulacionSeleccionada) ? (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            onClick={() => { setMostrarPopupPostulaciones(false); setPostulacionSeleccionada(null); }}
        >
            <div
                className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[700px] relative animate-fadeIn max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => { setMostrarPopupPostulaciones(false); setPostulacionSeleccionada(null); }}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
                >
                    ✕
                </button>

                {mostrarPostulacion()}
            </div>
        </div>
    ) : null;

    
    //VISTAS PERFIL Y POSTULAR

    if (curriculum && alumno) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setVista('perfil')} className={`py-2 px-4 rounded ${isPerfil ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                Mi perfil
                            </button>
                            <button onClick={() => setVista('postular')} className={`py-2 px-4 rounded ${isPostular ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                Postular
                            </button>
                        </div>
                        <button onClick={logout} className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded transition duration-200">
                            Cerrar Sesión
                        </button>
                    </div>

                    {vista === 'perfil' ? (
                        <div className="text-black">
                            <div className="text-xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <p><b>RUT:</b> {user.rut}</p>
                                <p><b>Nombre:</b> {user.nombres} {user.apellido}</p>
                                <p><b>Correo:</b> {curriculum?.correo}</p>
                                <p><b>Año de ingreso:</b> {alumno?.fecha_admision}</p>
                                <p><b>Semestre actual:</b> {alumno?.nivel}</p>
                            </div>
                            <div className="mt-4">
                                <button onClick={() => setMostrarPopup(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Ver documento
                                </button>
                                {popupCurriculum}
                            </div>
                            

                            <div className="mt-6">
                                <h2>Postulaciones Activas</h2>
                                <ul>
                                    {postulaciones && postulaciones.length > 0 ? (
                                        postulaciones.map((p: any) => (
                                            <li key={p.id}>
                                                <p><b>Asignatura: </b> {p.nombre_asignatura}</p>
                                                <p><b>Descripción carta: </b>
                                                    <button onClick={() => { setPostulacionSeleccionada(p); setMostrarPopupPostulaciones(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Ver documento</button>
                                                </p>
                                                <p><b>Acción: </b> <button onClick={() => cancelarPostulacion.mutate({id: p.id})} className="bg-blue-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Cancelar postulación</button></p>
                                            </li>
                                        ))
                                    ) : (
                                        <p>No hay postulaciones activas.</p>
                                    )}
                                </ul>

                                {popupPostulacion}

                            </div>
                        </div>
                    ) : (
                        <div className="text-black">
                            <h2 className="text-xl font-bold mb-4">Postular</h2>
                            <div className="flex items-center space-x-2">
                            </div>

                            <div className="mt-6">
                                <h3 className="text-xl font-bold mb-4">Datos de Postulación</h3>
                                <form onSubmit={handleSubmitPostulacion} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-black">Asignatura</label>
                                            <select
                                                name="id_asignatura"
                                                value={formPostulacion.id_asignatura}
                                                onChange={(e) => {
                                                    const selectedId = e.target.value;
                                                    const found = asignaturasDisponibles?.find((a: any) => String(a.id) === String(selectedId));
                                                    setFormPostulacion({
                                                        ...formPostulacion,
                                                        id_asignatura: selectedId,
                                                        nombre_asignatura: found?.nombre
                                                    });
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                                            >
                                                <option value="">Seleccione una asignatura</option>
                                                {asignaturasDisponibles && asignaturasDisponibles.length > 0 ? (
                                                    asignaturasDisponibles.map((a: any) => (
                                                        <option key={a.id} value={String(a.id)}>{a.nombre}</option>
                                                    ))
                                                ) : (
                                                    <option value="">No hay asignaturas disponibles</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black">Escriba Carta de interés: </label>
                                        <textarea name="descripcion_carta" value={formPostulacion.descripcion_carta} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded h-28" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-black">Correo del profesor para recomendación: </label>
                                            <input name="correo_profe" value={formPostulacion.correo_profe} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black">Actividad Propuesta: </label>
                                            <input name="actividad" value={formPostulacion.actividad} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black">Metodología: </label>
                                            <input name="metodologia" value={formPostulacion.metodologia} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-black">Día</label>
                                            <select name="dia" value={formPostulacion.dia} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
                                                <option value="">Seleccione un día</option>
                                                <option value="Lunes">Lunes</option>
                                                <option value="Martes">Martes</option>
                                                <option value="Miércoles">Miércoles</option>
                                                <option value="Jueves">Jueves</option>
                                                <option value="Viernes">Viernes</option>
                                                <option value="Sábado">Sábado</option>
                                                <option value="Domingo">Domingo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black">Bloque</label>
                                            <select name="bloque" value={formPostulacion.bloque} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
                                                <option value="">Seleccione un bloque</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="C2">C2</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                                <option value="F">F</option>
                                                <option value="G">G</option>
                                                <option value="H">H</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 pt-2">
                                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">Enviar Postulación</button>
                                        <button type="button" onClick={() => setFormPostulacion({ rut_alumno: '', id_asignatura: '', nombre_asignatura: '', descripcion_carta: '', correo_profe: '', actividad: '', metodologia: '', dia: '', bloque: '' })} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded">Limpiar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (curriculum && user.tipo === 'admin') {

        return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                         <button onClick={() => setVista('perfil')} className={`py-2 px-4 rounded ${isPerfil ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            Mi perfil
                        </button>
                        <button onClick={() => setVista('postular')} className={`py-2 px-4 rounded ${isPostular ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            Postular
                        </button>
                    </div>
                    <button onClick={logout} className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded transition duration-200">
                        Cerrar Sesión
                    </button>
                </div>
                
                {vista === 'perfil' ? (
                    <div className="text-black">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <p><b>RUT:</b> {user.rut}</p>
                            <p><b>Nombre:</b> {user.nombres} {user.apellido}</p>
                            <p><b>Correo:</b> {curriculum?.correo}</p>
                            <p><b>Año de ingreso: </b>No aplica</p>
                            <p><b>Semestre actual: </b>No aplica</p>
                        </div>
                        <div className="mt-4">
                            <button onClick={() => setMostrarPopup(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Ver documento
                            </button>
                            {popupCurriculum}
                        </div>

                        <div className="mt-6">
                            <h2>Postulaciones Activas</h2>
                                <ul>
                                    {postulaciones && postulaciones.length > 0 ? (
                                        postulaciones.map((p: any) => (
                                            <li key={p.id}>
                                                <p><b>Asignatura: </b> {p.nombre_asignatura}</p>
                                                <p><b>Descripción carta: </b>
                                                    <button onClick={() => { setPostulacionSeleccionada(p); setMostrarPopupPostulaciones(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Ver documento</button>
                                                </p>
                                                <p><b>Acción: </b> <button onClick={() => cancelarPostulacion.mutate({id: p.id})} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Cancelar postulación</button></p>
                                            </li>
                                        ))
                                    ) : (
                                        <p>No hay postulaciones activas.</p>
                                    )}
                                </ul>

                                {popupPostulacion}


                        </div>
                    </div>
                    ) : (
                        <div className="text-black">
                            <h2 className="text-xl font-bold mb-4">Postular</h2>
                            <div className="flex items-center space-x-2 mb-4">
                               
                            </div>
                                    <div className="mt-6">
                                <h3 className="text-xl font-bold mb-4">Datos de Postulación</h3>
                                <form onSubmit={handleSubmitPostulacion} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Asignatura</label>
                                            <select
                                                name="id_asignatura"
                                                value={formPostulacion.id_asignatura}
                                                onChange={(e) => {
                                                    const selectedId = e.target.value;
                                                    const found = asignaturasDisponibles?.find((a: any) => String(a.id) === String(selectedId));
                                                    setFormPostulacion({
                                                        ...formPostulacion,
                                                        id_asignatura: selectedId,
                                                        nombre_asignatura: found?.nombre
                                                    });
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                                            >
                                                <option value="">Seleccione una asignatura</option>
                                                {asignaturasTodas && asignaturasTodas.length > 0 ? (
                                                    asignaturasTodas.map((a: any) => (
                                                        <option key={a.id} value={String(a.id)}>{a.nombre}</option>
                                                    ))
                                                ) : (
                                                    <option value="">No hay asignaturas disponibles</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Escriba Carta de interés: </label>
                                        <textarea name="descripcion_carta" value={formPostulacion.descripcion_carta} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded h-28" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Correo del profesor para recomendación: </label>
                                            <input name="correo_profe" type="email" value={formPostulacion.correo_profe} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                                        </div>

                                        <h3 className="text-xl font-bold mb-4">Plan de trabajo</h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Actividad propuesta: </label>
                                            <input name="actividad" value={formPostulacion.actividad} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Metodología: </label>
                                            <textarea name="metodologia" value={formPostulacion.metodologia} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded h-28" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Día</label>
                                            <select name="dia" value={formPostulacion.dia} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
                                                <option value="">Seleccione un día</option>
                                                <option value="Lunes">Lunes</option>
                                                <option value="Martes">Martes</option>
                                                <option value="Miércoles">Miércoles</option>
                                                <option value="Jueves">Jueves</option>
                                                <option value="Viernes">Viernes</option>
                                                <option value="Sábado">Sábado</option>
                                                <option value="Domingo">Domingo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bloque</label>
                                            <select name="bloque" value={formPostulacion.bloque} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
                                                <option value="">Seleccione un bloque</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="C2">C2</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                                <option value="F">F</option>
                                                <option value="G">G</option>
                                                <option value="H">H</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 pt-2">
                                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">Enviar Postulación</button>
                                        <button type="button" onClick={() => setFormPostulacion({ rut_alumno: '', id_asignatura: '', nombre_asignatura: '', descripcion_carta: '', correo_profe: '', actividad: '', metodologia: '', dia: '', bloque: '' })} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded">Limpiar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
            </div>
        </div>
        );

    }
*/

"use client";

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useUserProfile, User } from '@/hooks/useUserProfile';
import { useAlumnoProfile, AlumnoData } from '@/hooks/useAlumnoProfile';
import { useComprobarCurriculum, useCrearCurriculum, useActividadesExtracurriculares, useActividadescientificas, useCursos_titulos_grados, useAyudantias, CurriculumResponse, useEditarCurriculum} from '@/hooks/useCurriculum';
import { useAuth } from '@/context/AuthContext';
import { AyudantiasAnteriores, useAyudantiasPorAlumno } from '@/hooks/useAyudantia';
import { PostulacionData, usePostulacionesPorAlumno, useCancelarPostulacion, useCrearPostulacion } from '@/hooks/usePostulacion';
import { useAsignaturasDisponiblesPostulacion, useTodasAsignaturas } from '@/hooks/useAsignaturas';
import Cookies from 'js-cookie';
import Select from 'react-select';
import FormularioEditarCurriculum from "@/components/formularioEditarCurriculum";


// componente de tarjeta de info
const InfoCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

// componente de badge para estados
const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" }) => {
    const variants = {
        default: "bg-blue-100 text-blue-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800"
    };
    
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
            {children}
        </span>
    );
};
interface UserProps {
    user: User;
    alumno?: AlumnoData;
    curriculum?: CurriculumResponse;
    actividadesExtracurriculares?: any;
    actividadesCientificas?: any;
    cursosTitulosGrados?: any;
    ayudantias?: any;
    ayudantiasAnteriores?: any;
    postulaciones?: any;
    cancelarPostulacion?: any;
    asignaturasDisponibles?: any;
    asignaturasTodas?: any;
}

interface OptionType {
  value: string;
  label: string;
}

export const PostulanteVista = ({user, alumno, curriculum, actividadesExtracurriculares, actividadesCientificas, cursosTitulosGrados, ayudantias, ayudantiasAnteriores, postulaciones, cancelarPostulacion, asignaturasDisponibles, asignaturasTodas}: UserProps) => {
    const crearCurriculum = useCrearCurriculum();
    const crearPostulacion = useCrearPostulacion();
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    type Vista = 'perfil' | 'postular';
    const [paso, setPaso] = useState<number>(1);
    const [mostrarPopup, setMostrarPopup] = useState<boolean>(false);
    const [mostrarPopupPostulaciones, setMostrarPopupPostulaciones] = useState<boolean>(false);
    const [postulacionSeleccionada, setPostulacionSeleccionada] = useState<any>(null);
    const [vista, setVista] = useState<Vista>('perfil');
    const isPerfil = vista === 'perfil';
    const isPostular = vista === 'postular';

    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  
    const [form, setForm] = useState({
        rut_alumno: user.rut || "",
        nombres: "",
        apellidos:  "",
        fecha_nacimiento: "",
        comuna: "",
        ciudad: "",
        num_celular: "",
        correo: "",
        carrera: "",
        otros: "",
        ayudantias: [{ nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" }],
        cursos_titulos_grados: [{ nombre_asig: "", n_coordinador: "", evaluacion: "" }],
        actividades_cientificas: [{ nombre: "", descripcion: "", periodo_participacion: "" }],
        actividades_extracurriculares: [
        { nombre: "", docente: "", descripcion: "", periodo_participacion: "" },
        ],
    });

    const [formPostulacion, setFormPostulacion] = useState({
        rut_alumno: "",
        id_asignatura: "",
        nombre_asignatura: "",
        descripcion_carta: "",
        correo_profe: "",
        actividad: "",
        metodologia: "",
        dia: "",
        bloque: "",
    });

    const logout = () => {
        setToken(null);
        setUsertipo(null);
        Cookies.remove('token');
        Cookies.remove('tipoUser');
        router.push('/login');
        router.refresh();
    }

    

    const mostrarCurriculum = () => {
        return (
        <div className="text-gray-800 space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Curriculum Vitae</h2>
                <p className="text-gray-600 mt-2">Información académica y profesional</p>
            </div>
            
            <InfoCard title="Información Personal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">RUT</p>
                        <p className="font-medium">{curriculum?.usuario.rut}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Nombre</p>
                        <p className="font-medium">{curriculum?.nombres} {curriculum?.apellidos}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                        <p className="font-medium">{curriculum?.fecha_nacimiento}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Comuna</p>
                        <p className="font-medium">{curriculum?.comuna}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Ciudad</p>
                        <p className="font-medium">{curriculum?.ciudad}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Número de celular</p>
                        <p className="font-medium">{curriculum?.Num_Celular}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Correo</p>
                        <p className="font-medium">{curriculum?.correo}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Carrera</p>
                        <p className="font-medium">{curriculum?.carrera}</p>
                    </div>
                    {curriculum?.otros && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Otros</p>
                            <p className="font-medium">{curriculum?.otros}</p>
                        </div>
                    )}
                </div>
            </InfoCard>

            {ayudantias && Array.isArray(ayudantias) && ayudantias.length > 0 && (
                <InfoCard title="Ayudantías Currículum">
                    <div className="space-y-4">
                        {ayudantias.map((a: any) => (
                            <div key={a.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                <p className="font-medium text-gray-900">Nombre: {a.nombre_asig}</p>
                                <p className="text-sm text-gray-600">Coordinador: {a.nombre_coordinador}</p>
                                <p className="text-sm text-gray-600">Evaluación: {a.evaluacion}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}

            {ayudantiasAnteriores && Array.isArray(ayudantiasAnteriores) && ayudantiasAnteriores.length > 0 && (
                <InfoCard title="Ayudantías Anteriores">
                    <div className="space-y-4">
                        {ayudantiasAnteriores.map((a: AyudantiasAnteriores) => (
                            <div key={a.id} className="border-l-4 border-green-500 pl-4 py-2">
                                <p className="font-medium text-gray-900">Nombre: {a.nombre_asig}</p>
                                <p className="text-sm text-gray-600">Coordinador: {a.n_coordinador}</p>
                                <p className="text-sm text-gray-600">RUT coordinador: {a.rut_coordinador_otro}</p>
                                <p className="text-sm text-gray-600">Evaluación: {a.evaluacion}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}

            {cursosTitulosGrados && Array.isArray(cursosTitulosGrados) && cursosTitulosGrados.length > 0 && (
                <InfoCard title="Cursos, Títulos y Grados">
                    <div className="space-y-4">
                        {cursosTitulosGrados.map((c: any) => (
                            <div key={c.id} className="border-l-4 border-purple-500 pl-4 py-2">
                                <p className="font-medium text-gray-900">Nombre: {c.nombre_asig}</p>
                                <p className="text-sm text-gray-600">Coordinador: {c.n_coordinador}</p>
                                <p className="text-sm text-gray-600">Evaluación: {c.evaluacion}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}

            {actividadesCientificas && Array.isArray(actividadesCientificas) && actividadesCientificas.length > 0 && (
                <InfoCard title="Actividades Científicas">
                    <div className="space-y-4">
                        {actividadesCientificas.map((a: any) => (
                            <div key={a.id} className="border-l-4 border-orange-500 pl-4 py-2">
                                <p className="font-medium text-gray-900">Nombre: {a.nombre}</p>
                                <p className="text-sm text-gray-600">Descripción: {a.descripcion}</p>
                                <p className="text-sm text-gray-600">Periodo: {a.periodo_participacion}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}

            {actividadesExtracurriculares && Array.isArray(actividadesExtracurriculares) && actividadesExtracurriculares.length > 0 && (
                <InfoCard title="Actividades Extracurriculares">
                    <div className="space-y-4">
                        {actividadesExtracurriculares.map((a: any) => (
                            <div key={a.id} className="border-l-4 border-teal-500 pl-4 py-2">
                                <p className="font-medium text-gray-900">{a.nombre}</p>
                                <p className="text-sm text-gray-600">Docente: {a.docente}</p>
                                <p className="text-sm text-gray-600">Descripción:{a.descripcion}</p>
                                <p className="text-sm text-gray-600">Periodo: {a.periodo_participacion}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}
        </div>
        );
    }

    const mostrarPostulacion = () => {
        if (!postulacionSeleccionada) return null;  
        return (
            <div className="space-y-4 text-black">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Detalles de Postulación</h2>
                <InfoCard title="Información de la Postulación">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Asignatura</p>
                            <p className="font-medium">{postulacionSeleccionada.nombre_asignatura}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Correo del profesor</p>
                            <p className="font-medium">{postulacionSeleccionada.correo_profe}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Actividad</p>
                            <p className="font-medium">{postulacionSeleccionada.actividad}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Metodología</p>
                            <p className="font-medium">{postulacionSeleccionada.metodologia}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Día</p>
                            <p className="font-medium">{postulacionSeleccionada.dia}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Bloque</p>
                            <p className="font-medium">{postulacionSeleccionada.bloque}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Carta de interés</p>
                            <p className="font-medium mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                {postulacionSeleccionada.descripcion_carta}
                            </p>
                        </div>
                    </div>
                </InfoCard>
            </div>
        );
    }

    const handleSubmitPostulacion = (e: SyntheticEvent) => {
        e.preventDefault();
        console.log("enviando postulacion: ", formPostulacion);
        crearPostulacion.mutate({ ...formPostulacion, rut_alumno: user.rut });
        
        setFormPostulacion({
            rut_alumno: "",
            id_asignatura: "",
            nombre_asignatura: "",
            descripcion_carta: "",
            correo_profe: "",
            actividad: "",
            metodologia: "",
            dia: "",
            bloque: "",
        });
    };

    const popupCurriculum = mostrarPopup ? (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setMostrarPopup(false)}
        >
            <div
                className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[800px] relative animate-fadeIn max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setMostrarPopup(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl transition-colors"
                >
                    ✕
                </button>
                {mostrarCurriculum()}
            </div>
        </div>
    ) : null;

    const popupEditarCurriculum = modoEdicion && curriculum ? (
    <div
        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setModoEdicion(false)}
    >
        <div
            className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[800px] relative animate-fadeIn max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={() => setModoEdicion(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl transition-colors"
            >
                ✕
            </button>

            <FormularioEditarCurriculum
                datosIniciales={curriculum}
                onCancel={() => setModoEdicion(false)}
            />
        </div>
    </div>
) : null;

    const popupPostulacion = (mostrarPopupPostulaciones && postulacionSeleccionada) ? (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            onClick={() => { setMostrarPopupPostulaciones(false); setPostulacionSeleccionada(null); }}
        >
            <div
                className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-[700px] relative animate-fadeIn max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => { setMostrarPopupPostulaciones(false); setPostulacionSeleccionada(null); }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl transition-colors"
                >
                    ✕
                </button>
                {mostrarPostulacion()}
            </div>
        </div>
    ) : null;

    const opcionesAsignaturas: OptionType[] =
        asignaturasTodas?.map((a: any) => ({
            value: String(a.id),
            label: a.nombre,
        })) || [];

    const opcionesAsignaturasDisponibles =
         asignaturasDisponibles?.map((a: any) => ({
            value: String(a.id),
            label: a.nombre,
        })) || [];


    
    if (curriculum && user.tipo === 'alumno') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Portal del Postulante
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Gestiona tu perfil y postulaciones
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button 
                                        onClick={() => setVista('perfil')} 
                                        className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                                            isPerfil 
                                                ? 'bg-white text-blue-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Mi Perfil
                                    </button>
                                    <button 
                                        onClick={() => setVista('postular')} 
                                        className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                                            isPostular 
                                                ? 'bg-white text-blue-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Postular
                                    </button>
                                </div>
                                <button 
                                    onClick={logout} 
                                    className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                                >
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <InfoCard title="Información Personal">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-black">RUT</p>
                                        <p className="font-medium">{user.rut}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-black">Nombre</p>
                                        <p className="font-medium">{user.nombres} {user.apellido}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-black">Correo</p>
                                        <p className="font-medium">{curriculum?.correo}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-black">Año de ingreso</p>
                                        <p className="font-medium">{alumno?.fecha_admision}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-black">Semestre actual</p>
                                        <Badge variant="success">{alumno?.nivel}</Badge>
                                    </div>
                                </div>
                            </InfoCard>

                            <button 
                                onClick={() => setMostrarPopup(true)} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                            >
                                <span>📄</span>
                                Ver Curriculum Completo
                            </button>

                            <button
                                onClick={() => setModoEdicion(true)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                ✏️ Editar
                            </button>
                        </div>

                        
                        <div className="lg:col-span-2">
                            {vista === 'perfil' ? (
                                <div className="space-y-6">
                                    <InfoCard title="Postulaciones Activas">
                                        {postulaciones && postulaciones.length > 0 ? (
                                            <div className="space-y-4">
                                                {postulaciones.map((p: any) => (
                                                    <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{p.nombre_asignatura}</p>
                                                        </div>
                                                        <div className="flex gap-2 mt-2 md:mt-0">
                                                            <button 
                                                                onClick={() => { setPostulacionSeleccionada(p); setMostrarPopupPostulaciones(true); }} 
                                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                                                            >
                                                                Ver Detalles
                                                            </button>
                                                            <button 
                                                                onClick={() => cancelarPostulacion.mutate({id: p.id})} 
                                                                className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="text-gray-400 text-6xl mb-4">📝</div>
                                                <p className="text-gray-600">No hay postulaciones activas</p>
                                                <p className="text-sm text-gray-500 mt-1">Vaya a la pestaña #Postular# para crear una nueva postulación</p>
                                            </div>
                                        )}
                                    </InfoCard>
                                </div>
                            ) : (
                                <div title="Nueva Postulación" className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Postulación</h3>

                                    <form onSubmit={handleSubmitPostulacion} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Asignatura
                                            </label>

                                            {opcionesAsignaturasDisponibles.length > 0 ? (
                                                <Select
                                                    options={opcionesAsignaturasDisponibles}
                                                    value={
                                                        opcionesAsignaturas.find(
                                                        (opt) => opt.value === String(formPostulacion.id_asignatura)
                                                        ) || null
                                                    }
                                                    onChange={(selectedOption) => {
                                                        if (!selectedOption) return;
                                                        setFormPostulacion({
                                                        ...formPostulacion,
                                                        id_asignatura: selectedOption.value,
                                                        nombre_asignatura: selectedOption.label,
                                                        });
                                                    }}
                                                    placeholder="Seleccione una asignatura"
                                                    isSearchable
                                                    styles={{
                                                        menu: (provided) => ({
                                                        ...provided,
                                                        maxHeight: 200,
                                                        overflowY: "auto",
                                                        }),
                                                    }}
                                                />
                                            ) : (
                                                <p className="text-gray-500 italic">No hay asignaturas disponibles</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Carta de interés</label>
                                            <textarea 
                                                name="descripcion_carta" 
                                                value={formPostulacion.descripcion_carta} 
                                                onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32"
                                                placeholder="Describe por qué estás interesado en esta ayudantía..."
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Correo del profesor</label>
                                                <input 
                                                    name="correo_profe" 
                                                    type="email"
                                                    value={formPostulacion.correo_profe} 
                                                    onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="profesor@universidad.cl"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Actividad propuesta</label>
                                                <input 
                                                    name="actividad" 
                                                    value={formPostulacion.actividad} 
                                                    onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Ej: Resolución de ejercicios"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Metodología</label>
                                                <input 
                                                    name="metodologia" 
                                                    value={formPostulacion.metodologia} 
                                                    onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="Ej: Aprendizaje activo"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Día preferente</label>
                                                <select 
                                                    name="dia" 
                                                    value={formPostulacion.dia} 
                                                    onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    required
                                                >
                                                    <option value="">Seleccione un día</option>
                                                    <option value="Lunes">Lunes</option>
                                                    <option value="Martes">Martes</option>
                                                    <option value="Miércoles">Miércoles</option>
                                                    <option value="Jueves">Jueves</option>
                                                    <option value="Viernes">Viernes</option>
                                                    <option value="Sábado">Sábado</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Bloque horario</label>
                                                <select 
                                                    name="bloque" 
                                                    value={formPostulacion.bloque} 
                                                    onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    required
                                                >
                                                    <option value="">Seleccione un bloque</option>
                                                    <option value="A">A (08:10 - 09:30)</option>
                                                    <option value="B">B (09:55 - 11:20)</option>
                                                    <option value="C">C (11:40 - 13:10)</option>
                                                    <option value="C2">C2 (13:10 - 14:30)</option>
                                                    <option value="D">D (14:30 - 16:00)</option>
                                                    <option value="E">E (16:15 - 17:47)</option>
                                                    <option value="F">F (18:00 - 19:30)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button 
                                                type="submit" 
                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2"
                                            >
                                                <span>📨</span>
                                                Enviar Postulación
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setFormPostulacion({ rut_alumno: '', id_asignatura: '', nombre_asignatura: '', descripcion_carta: '', correo_profe: '', actividad: '', metodologia: '', dia: '', bloque: '' })} 
                                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-200"
                                            >
                                                Limpiar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {popupCurriculum}
                {popupPostulacion}
            </div>
        );
    }

   
    if (curriculum && user.tipo === 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Portal del Postulante
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Gestiona tu perfil y postulaciones
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button 
                                        onClick={() => setVista('perfil')} 
                                        className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                                            isPerfil 
                                                ? 'bg-white text-blue-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Mi Perfil
                                    </button>
                                    <button 
                                        onClick={() => setVista('postular')} 
                                        className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                                            isPostular 
                                                ? 'bg-white text-blue-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Postular
                                    </button>
                                </div>
                                <button 
                                    onClick={logout} 
                                    className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                                >
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-500">
                        <div className="lg:col-span-1 space-y-6">
                            <InfoCard title="Información Personal">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-black">RUT</p>
                                        <p className="font-medium">{user.rut}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Nombre</p>
                                        <p className="font-medium">{user.nombres} {user.apellido}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Correo</p>
                                        <p className="font-medium">{curriculum?.correo}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Año de ingreso</p>
                                        <Badge variant="default">No aplica</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Semestre actual</p>
                                        <Badge variant="default">No aplica</Badge>
                                    </div>
                                    {<div>
                                        <p className="text-sm text-gray-600">Rol</p>
                                        <Badge variant="success">Administrador</Badge>
                                    </div>}
                                </div>
                            </InfoCard>

                            <button 
                                onClick={() => setMostrarPopup(true)} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                            >
                                <span>📄</span>
                                Ver Curriculum Completo
                            </button>

                            <button
                                onClick={() => setModoEdicion(true)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                ✏️ Editar
                            </button>
                        </div>
                        


                        <div className="lg:col-span-2">
                            {vista === 'perfil' ? (
                                <div className="space-y-6">
                                    <InfoCard title="Postulaciones Activas">
                                        {postulaciones && postulaciones.length > 0 ? (
                                            <div className="space-y-4">
                                                {postulaciones.map((p: any) => (
                                                    <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{p.nombre_asignatura}</p>
                                                            <p className="text-sm text-gray-600">Postulacion creada</p>
                                                        </div>
                                                        <div className="flex gap-2 mt-2 md:mt-0">
                                                            <button 
                                                                onClick={() => { setPostulacionSeleccionada(p); setMostrarPopupPostulaciones(true); }} 
                                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                                                            >
                                                                Ver Detalles
                                                            </button>
                                                            <button 
                                                                onClick={() => cancelarPostulacion.mutate({id: p.id})} 
                                                                className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="text-gray-400 text-6xl mb-4">📝</div>
                                                <p className="text-gray-600">No hay postulaciones activas</p>
                                                <p className="text-sm text-gray-500 mt-1">Vaya a la pestaña #Postular# para crear una nueva postulación</p>
                                            </div>
                                        )}
                                    </InfoCard>
                                </div>
                            ) : (
                                <InfoCard title="Nueva Postulación">
                                    <form onSubmit={handleSubmitPostulacion} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Asignatura
                                            </label>

                                            {opcionesAsignaturas.length > 0 ? (
                                                <Select
                                                    options={opcionesAsignaturas}
                                                    value={
                                                        opcionesAsignaturas.find(
                                                        (opt) => opt.value === String(formPostulacion.id_asignatura)
                                                        ) || null
                                                    }
                                                    onChange={(selectedOption) => {
                                                        if (!selectedOption) return;
                                                        setFormPostulacion({
                                                        ...formPostulacion,
                                                        id_asignatura: selectedOption.value,
                                                        nombre_asignatura: selectedOption.label,
                                                        });
                                                    }}
                                                    placeholder="Seleccione una asignatura"
                                                    isSearchable
                                                    styles={{
                                                        menu: (provided) => ({
                                                        ...provided,
                                                        maxHeight: 200,
                                                        overflowY: "auto",
                                                        }),
                                                    }}
                                                />
                                            ) : (
                                                <p className="text-gray-500 italic">No hay asignaturas disponibles</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="descripcion_carta" className="block text-sm font-medium text-gray-700 mb-2">Carta de interés</label>
                                            <textarea name="descripcion_carta" value={formPostulacion.descripcion_carta} onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none" placeholder="Describe por qué estás interesado en esta ayudantía..." required/>
                                            
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Correo del profesor</label>
                                                <input 
                                                    name="correo_profe" 
                                                    type="email"
                                                    value={formPostulacion.correo_profe} 
                                                    onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="profesor@universidad.cl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Plan de Trabajo</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Actividad propuesta</label>
                                                    <input 
                                                        name="actividad" 
                                                        value={formPostulacion.actividad} 
                                                        onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="Ej: Resolución de ejercicios, revisión de contenidos..."
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Metodología</label>
                                                    <textarea 
                                                        name="metodologia" 
                                                        value={formPostulacion.metodologia} 
                                                        onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-24 resize-y"
                                                        placeholder="Describe la metodología de enseñanza que utilizarás..."
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Día preferente</label>
                                                <select 
                                                    name="dia" 
                                                    value={formPostulacion.dia} 
                                                    onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    required
                                                >
                                                    <option value="">Seleccione un día</option>
                                                    <option value="Lunes">Lunes</option>
                                                    <option value="Martes">Martes</option>
                                                    <option value="Miércoles">Miércoles</option>
                                                    <option value="Jueves">Jueves</option>
                                                    <option value="Viernes">Viernes</option>
                                                    <option value="Sábado">Sábado</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Bloque horario</label>
                                                <select 
                                                    name="bloque" 
                                                    value={formPostulacion.bloque} 
                                                    onChange={(e) => setFormPostulacion({ ...formPostulacion, [e.target.name]: e.target.value })} 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    required
                                                >
                                                    <option value="">Seleccione un bloque</option>
                                                    <option value="A">A (08:10 - 09:30)</option>
                                                    <option value="B">B (09:55 - 11:20)</option>
                                                    <option value="C">C (11:40 - 13:10)</option>
                                                    <option value="C2">C2 (13:10 - 14:30)</option>
                                                    <option value="D">D (14:30 - 16:00)</option>
                                                    <option value="E">E (16:15 - 17:47)</option>
                                                    <option value="F">F (18:00 - 19:30)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button 
                                                type="submit" 
                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2"
                                            >
                                                <span>📨</span>
                                                Enviar Postulación
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setFormPostulacion({ rut_alumno: '', id_asignatura: '', nombre_asignatura: '', descripcion_carta: '', correo_profe: '', actividad: '', metodologia: '', dia: '', bloque: '' })} 
                                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-200"
                                            >
                                                Limpiar
                                            </button>
                                        </div>
                                    </form>
                                </InfoCard>
                            )}
                        </div>
                    </div>
                </div>

                {popupCurriculum}
                {popupEditarCurriculum}
                {popupPostulacion}
            </div>
        );
    };

    
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

    
    const removeItem = (key: string, index: number) => {
        const newArray = (form as any)[key].filter((_: any, i: number) => i !== index);
        setForm({ ...form, [key]: newArray });
    };

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        crearCurriculum.mutate(form);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Crear Curriculum</h2>
                            <p className="text-gray-600 mt-1">
                                Completa tu información personal y académica
                            </p>
                        </div>
                        <button 
                            onClick={logout} 
                            className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso {paso} de 2</span>
                        <span className="text-sm font-medium text-blue-600">{paso === 1 ? 'Datos Personales' : 'Información Académica'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(paso / 2) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {paso === 1 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <form
                            className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setPaso(2);
                            }}
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">Datos Personales</h3>
                                <p className="text-gray-600 mt-2">Información básica de contacto</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="rut_alumno" className="block text-sm font-medium text-gray-700 mb-2">RUT</label>
                                    <input 
                                        id="rut_alumno" 
                                        name="rut_alumno" 
                                        value={form.rut_alumno} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                                        placeholder="12.345.678-9"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                                    <input 
                                        id="nombres" 
                                        name="nombres" 
                                        value={form.nombres} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                                        placeholder="Juan Andrés"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                                    <input 
                                        id="apellidos" 
                                        name="apellidos" 
                                        value={form.apellidos} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                                        placeholder="Pérez González"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                                    <input 
                                        id="fecha_nacimiento" 
                                        name="fecha_nacimiento" 
                                        type="date" 
                                        value={form.fecha_nacimiento} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-2">Comuna</label>
                                    <input 
                                        id="comuna" 
                                        name="comuna" 
                                        value={form.comuna} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                                        placeholder="Providencia"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                                    <input 
                                        id="ciudad" 
                                        name="ciudad" 
                                        value={form.ciudad} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                                        placeholder="Santiago"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="num_celular" className="block text-sm font-medium text-gray-700 mb-2">Número de celular</label>
                                    <input 
                                        id="num_celular" 
                                        name="num_celular" 
                                        type="number"
                                        value={form.num_celular} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                                    <input 
                                        id="email" 
                                        type="email" 
                                        name="correo" 
                                        value={form.correo} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                                        placeholder="tu.correo@universidad.cl"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="carrera" className="block text-sm font-medium text-gray-700 mb-2">Carrera</label>
                                    <input 
                                        id="carrera" 
                                        name="carrera" 
                                        value={form.carrera} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                                        placeholder="Medicina, Kinesiologia, etc..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center gap-2"
                                >
                                    <span>Siguiente</span>
                                    <span>→</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {paso === 2 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">Información Académica y Profesional</h3>
                                <p className="text-gray-600 mt-2">Completa tu experiencia y formación</p>
                            </div>
                            
                            <div className="border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Ayudantías Previas</h4>
                                    <button 
                                        type="button" 
                                        onClick={() => addItem("ayudantias", { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" })} 
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span>+</span>
                                        Agregar Ayudantía
                                    </button>
                                </div>
                                
                                {form.ayudantias.map((a, i) => (
                                    <div key={`ayudantia-${i}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-blue-50">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Asignatura</label>
                                            <input 
                                                placeholder="Nombre asignatura" 
                                                name="nombre_asig" 
                                                value={a.nombre_asig} 
                                                onChange={(e) => handleArrayChange(e, "ayudantias", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Coordinador</label>
                                            <input 
                                                placeholder="Nombre coordinador" 
                                                name="nombre_coordinador" 
                                                value={a.nombre_coordinador} 
                                                onChange={(e) => handleArrayChange(e, "ayudantias", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Evaluación</label>
                                            <input 
                                                placeholder="Evaluación obtenida" 
                                                name="evaluacion_obtenida" 
                                                type="number"
                                                value={a.evaluacion_obtenida} 
                                                onChange={(e) => handleArrayChange(e, "ayudantias", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                type="button" 
                                                onClick={() => removeItem("ayudantias", i)} 
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors w-full"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Cursos, Títulos y Grados</h4>
                                    <button 
                                        type="button" 
                                        onClick={() => addItem("cursos_titulos_grados", { nombre_asig: "", n_coordinador: "", evaluacion: "" })} 
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span>+</span>
                                        Agregar Curso/Título
                                    </button>
                                </div>
                                
                                {form.cursos_titulos_grados.map((c, i) => (
                                    <div key={`curso-${i}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-green-50">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Título/Curso</label>
                                            <input 
                                                placeholder="Nombre título o curso" 
                                                name="nombre_asig" 
                                                value={c.nombre_asig} 
                                                onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Institución</label>
                                            <input 
                                                placeholder="Institución" 
                                                name="n_coordinador" 
                                                value={c.n_coordinador} 
                                                onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                                            <input 
                                                type="date" 
                                                placeholder="Fecha" 
                                                name="evaluacion" 
                                                value={c.evaluacion} 
                                                onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                type="button" 
                                                onClick={() => removeItem("cursos_titulos_grados", i)} 
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors w-full"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Actividades Científicas</h4>
                                    <button 
                                        type="button" 
                                        onClick={() => addItem("actividades_cientificas", { nombre: "", descripcion: "", periodo_participacion: "" })} 
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span>+</span>
                                        Agregar Actividad
                                    </button>
                                </div>
                                
                                {form.actividades_cientificas.map((a, i) => (
                                    <div key={`actividad-${i}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-purple-50">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                                            <input 
                                                placeholder="Nombre actividad" 
                                                name="nombre" 
                                                value={a.nombre} 
                                                onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                                            <input 
                                                placeholder="Descripción" 
                                                name="descripcion" 
                                                value={a.descripcion} 
                                                onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Periodo</label>
                                            <input 
                                                placeholder="Periodo participación" 
                                                name="periodo_participacion" 
                                                value={a.periodo_participacion} 
                                                onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                type="button" 
                                                onClick={() => removeItem("actividades_cientificas", i)} 
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors w-full"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Actividades Extracurriculares</h4>
                                    <button 
                                        type="button" 
                                        onClick={() => addItem("actividades_extracurriculares", { nombre: "", docente: "", descripcion: "", periodo_participacion: "" })} 
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span>+</span>
                                        Agregar Actividad
                                    </button>
                                </div>
                                
                                {form.actividades_extracurriculares.map((a, i) => (
                                    <div key={`actividad-${i}`} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-orange-50">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                                            <input 
                                                placeholder="Nombre actividad" 
                                                name="nombre" 
                                                value={a.nombre} 
                                                onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Docente/Institución</label>
                                            <input 
                                                placeholder="Docente o institución" 
                                                name="docente" 
                                                value={a.docente} 
                                                onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                                            <input 
                                                placeholder="Descripción" 
                                                name="descripcion" 
                                                value={a.descripcion} 
                                                onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Periodo</label>
                                            <input 
                                                placeholder="Periodo participación" 
                                                name="periodo_participacion" 
                                                value={a.periodo_participacion} 
                                                onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} 
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                type="button" 
                                                onClick={() => removeItem("actividades_extracurriculares", i)} 
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors w-full"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border border-gray-200 rounded-xl p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h4>
                                <textarea 
                                    name="otros" 
                                    value={form.otros} 
                                    onChange={handleChange} 
                                    placeholder="Información adicional que consideres relevante para tu postulación (logros, habilidades, proyectos, etc.)..." 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none text-gray-800 placeholder-gray-400"
                                />
                            </div>

                            <div className="flex justify-between pt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setPaso(1)} 
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center gap-2"
                                >
                                    <span>←</span>
                                    Anterior
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center gap-2"
                                >
                                    <span>💾</span>
                                    Guardar Curriculum
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}


    //VISTA CREAR CURRICULUM

  /*  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                                <div key={`ayudantia-${i}` } className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded bg-gray-50">
                                    <input placeholder="Nombre asignatura" name="nombre_asig" value={a.nombre_asig} onChange={(e) => handleArrayChange(e, "ayudantias", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Coordinador" name="nombre_coordinador" value={a.nombre_coordinador} onChange={(e) => handleArrayChange(e, "ayudantias", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Evaluación" name="evaluacion_obtenida" value={a.evaluacion_obtenida} onChange={(e) => handleArrayChange(e, "ayudantias", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <button type="button" onClick={() => removeItem("ayudantias", i)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm">
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem("ayudantias", { nombre_asig: "", nombre_coordinador: "", evaluacion_obtenida: "" })} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium">
                                + Agregar Ayudantía
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Cursos, Títulos y Grados</h4>
                            {form.cursos_titulos_grados.map((c, i) => (
                                <div key={`curso-${i}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded bg-gray-50">
                                    <input placeholder="Nombre título" name="nombre_asig" value={c.nombre_asig} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Institución" name="n_coordinador" value={c.n_coordinador} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input type="date" placeholder="Fecha" name="evaluacion" value={c.evaluacion} onChange={(e) => handleArrayChange(e, "cursos_titulos_grados", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <button type="button" onClick={() => removeItem("cursos_titulos_grados", i)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm">
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem("cursos_titulos_grados", { nombre_asig: "", n_coordinador: "", evaluacion: "" })} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium">
                                + Agregar Curso/Título
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Actividades Científicas</h4>
                            {form.actividades_cientificas.map((a, i) => (
                                <div key={`actividad-${i} || ${i}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded bg-gray-50">
                                    <input placeholder="Nombre" name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Descripción" name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Periodo de participación" name="periodo_participacion" value={a.periodo_participacion} onChange={(e) => handleArrayChange(e, "actividades_cientificas", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <button type="button" onClick={() => removeItem("actividades_cientificas", i)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm">
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem("actividades_cientificas", { nombre: "", descripcion: "", periodo_participacion: "" })} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium">
                                + Agregar Actividad Científica
                            </button>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Actividades Extracurriculares</h4>
                            {form.actividades_extracurriculares.map((a, i) => (
                                <div key={`actividad-${i} || ${i}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-3 border rounded bg-gray-50">
                                    <input placeholder="Nombre" name="nombre" value={a.nombre} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Docente o institución" name="docente" value={a.docente} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Descripción" name="descripcion" value={a.descripcion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <input placeholder="Periodo de participación" name="periodo_participacion" value={a.periodo_participacion} onChange={(e) => handleArrayChange(e, "actividades_extracurriculares", i)} className="px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-800"/>
                                    <button type="button" onClick={() => removeItem("actividades_extracurriculares", i)}className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm">
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addItem("actividades_extracurriculares", { nombre: "", docente: "", descripcion: "", periodo_participacion: "" })} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm font-medium">
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
*/




//componente exportado 
export default function PostulantePage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const { data: alumno, isLoading: cargaAlumno} = useAlumnoProfile(user?.rut);
    const { data: curriculum , isLoading: cargaCurriculum } = useComprobarCurriculum(user?.rut);

    const { data: actividadesExtracurriculares } = useActividadesExtracurriculares(user?.rut);
    const { data: actividadesCientificas } = useActividadescientificas(user?.rut);
    const { data: cursosTitulosGrados } = useCursos_titulos_grados(user?.rut);
    const { data: ayudantias } = useAyudantias(user?.rut);

    const { data: ayudantiasAnteriores } = useAyudantiasPorAlumno(user?.rut);

    const { data: postulaciones } = usePostulacionesPorAlumno(user?.rut);

    const { data: asignaturasDisponibles } = useAsignaturasDisponiblesPostulacion(user?.rut);
    const { data: asignaturasTodas } = useTodasAsignaturas();

    const cancelarPostulacion = useCancelarPostulacion();

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

    return <PostulanteVista user={user} alumno={alumno} curriculum={curriculum} actividadesExtracurriculares={actividadesExtracurriculares} actividadesCientificas={actividadesCientificas} cursosTitulosGrados={cursosTitulosGrados} ayudantias={ayudantias} ayudantiasAnteriores={ayudantiasAnteriores} postulaciones={postulaciones} cancelarPostulacion={cancelarPostulacion} asignaturasDisponibles={asignaturasDisponibles} asignaturasTodas={asignaturasTodas} />;
}

